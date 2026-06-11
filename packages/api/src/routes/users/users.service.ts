import { validateProfileInput } from "@barakah/core/users";
import type { R2Bucket, R2ObjectBody } from "@cloudflare/workers-types";
import { eq, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Database } from "@/db";
import {
  account,
  user as authUser,
  dhikrAggregate,
  dhikrDaily,
  emailQueue,
  polarOrders,
  prayerLogs,
  prayerTimeCaches,
  session,
  shieldSelection,
  subscriptions,
  userAchievementCounters,
  userAchievements,
  userLocations,
  users,
} from "@/db/schema";
import { avatarKey, getAvatar, putAvatar } from "@/lib/r2";
import { runEvaluate } from "@/routes/achievements/achievements.service";
import { UNPROCESSABLE_ENTITY } from "@/stoker/http-status-codes";

type ProfileRow = typeof users.$inferSelect;

export interface ProfileInput {
  activePrayerLocationId?: string;
  calcMethod?: ProfileRow["calcMethod"];
  completedAt?: string;
  consistency?: ProfileRow["consistency"];
  gender?: ProfileRow["gender"];
  goal?: ProfileRow["goal"];
  locationGranted?: boolean;
  madhab?: ProfileRow["madhab"];
  name?: string;
  notifGranted?: boolean;
  prayersToLock?: ProfileRow["prayersToLock"];
  strictness?: ProfileRow["strictness"];
  struggle?: ProfileRow["struggle"];
}

export async function getProfile(
  db: Database,
  authUserId: string
): Promise<ProfileRow | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);
  return row ?? null;
}

export async function upsertProfile(
  db: Database,
  authUserId: string,
  input: ProfileInput
): Promise<ProfileRow> {
  try {
    validateProfileInput(input);
  } catch (error) {
    throw new HTTPException(UNPROCESSABLE_ENTITY, {
      message: error instanceof Error ? error.message : "Invalid profile",
    });
  }

  // Atomic upsert keyed on the UNIQUE authUserId index — the prior
  // select-then-insert raced under concurrent onboarding requests and could
  // create duplicate profile rows.
  const updates = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
  await db
    .insert(users)
    .values({ id: crypto.randomUUID(), authUserId, ...input })
    .onConflictDoUpdate({
      target: users.authUserId,
      set: Object.keys(updates).length > 0 ? updates : { authUserId },
    });
  // Onboarding completion can unlock first_steps (matches Convex upsertProfile).
  await runEvaluate(db, { authUserId });
  return (await getProfile(db, authUserId)) as ProfileRow;
}

/**
 * Validate + store an avatar blob in R2 (worker-proxied upload — no presigned
 * URL; see migration §6) and point the profile row at its key. The key is
 * deterministic per user, so re-upload overwrites in place. Replaces Convex
 * `generateAvatarUploadUrl` + `setAvatar`.
 */
export async function setAvatar(
  db: Database,
  r2: R2Bucket,
  authUserId: string,
  body: ArrayBuffer,
  contentType: string | null
): Promise<string> {
  const key = avatarKey(authUserId);
  try {
    await putAvatar(r2, key, body, contentType);
  } catch (error) {
    throw new HTTPException(UNPROCESSABLE_ENTITY, {
      message: error instanceof Error ? error.message : "Invalid avatar",
    });
  }

  await db
    .insert(users)
    .values({ id: crypto.randomUUID(), authUserId, image: key })
    .onConflictDoUpdate({
      target: users.authUserId,
      set: { image: key },
    });
  return key;
}

/** Fetch the user's avatar blob from R2, or null if they have none. */
export async function getAvatarObject(
  db: Database,
  r2: R2Bucket,
  authUserId: string
): Promise<R2ObjectBody | null> {
  const profile = await getProfile(db, authUserId);
  if (!profile?.image) {
    return null;
  }
  return getAvatar(r2, profile.image);
}

/**
 * App-Store-required account deletion (P0). Removes the avatar blob, every
 * user-keyed app row (by authUserId, plus email-keyed Polar rows), and the
 * Better Auth identity (the `user` row cascades to `account`/`session` via FK).
 * D1 DELETEs are set-based, so no Convex-style batch draining is needed.
 *
 * KV note: Better Auth session blobs cached in KV are left to TTL-expire — the
 * D1 session rows are gone so they no longer resolve.
 */
export async function purgeUserData(
  db: Database,
  r2: R2Bucket,
  authUserId: string,
  email: string | null,
  avatarKey?: string | null
): Promise<void> {
  if (avatarKey) {
    await r2.delete(avatarKey);
  }

  const normalizedEmail = email?.toLowerCase().trim() || null;

  // Single atomic batch so the P0 account-deletion path can't partially apply
  // and leave orphaned user data (D1 has no interactive txn). Email-keyed Polar
  // rows + queued emails are folded in via normalizedEmail. `prayerTimeCaches`
  // is keyed on `userId`, which stores the Better Auth user id (== authUserId).
  // Better Auth identity is deleted last; its FK ON DELETE cascade clears
  // account + session, but we also delete them explicitly for completeness.
  await db.batch([
    db.delete(users).where(eq(users.authUserId, authUserId)),
    // lower() on the email-keyed deletes: rows written before write-time email
    // normalization can carry mixed-case addresses, and the P0 deletion path
    // must catch those too.
    db
      .delete(subscriptions)
      .where(
        normalizedEmail
          ? or(
              eq(subscriptions.authUserId, authUserId),
              sql`lower(${subscriptions.customerEmail}) = ${normalizedEmail}`
            )
          : eq(subscriptions.authUserId, authUserId)
      ),
    normalizedEmail
      ? db
          .delete(polarOrders)
          .where(
            or(
              eq(polarOrders.authUserId, authUserId),
              sql`lower(${polarOrders.customerEmail}) = ${normalizedEmail}`
            )
          )
      : db.delete(polarOrders).where(eq(polarOrders.authUserId, authUserId)),
    // Drop any queued/pending transactional emails so nothing is sent to a
    // deleted user post-deletion (only resolvable by email).
    ...(normalizedEmail
      ? [
          db
            .delete(emailQueue)
            .where(sql`lower(${emailQueue.to}) = ${normalizedEmail}`),
        ]
      : []),
    db.delete(prayerLogs).where(eq(prayerLogs.authUserId, authUserId)),
    db
      .delete(shieldSelection)
      .where(eq(shieldSelection.authUserId, authUserId)),
    db.delete(dhikrDaily).where(eq(dhikrDaily.authUserId, authUserId)),
    db.delete(dhikrAggregate).where(eq(dhikrAggregate.authUserId, authUserId)),
    db.delete(userLocations).where(eq(userLocations.authUserId, authUserId)),
    db
      .delete(userAchievements)
      .where(eq(userAchievements.authUserId, authUserId)),
    db
      .delete(userAchievementCounters)
      .where(eq(userAchievementCounters.authUserId, authUserId)),
    db.delete(prayerTimeCaches).where(eq(prayerTimeCaches.userId, authUserId)),
    db.delete(session).where(eq(session.userId, authUserId)),
    db.delete(account).where(eq(account.userId, authUserId)),
    db.delete(authUser).where(eq(authUser.id, authUserId)),
  ]);
}

export async function deleteMyAccount(
  db: Database,
  r2: R2Bucket,
  authUserId: string,
  email: string | null
): Promise<void> {
  const profile = await getProfile(db, authUserId);
  await purgeUserData(db, r2, authUserId, email, profile?.image ?? null);
}

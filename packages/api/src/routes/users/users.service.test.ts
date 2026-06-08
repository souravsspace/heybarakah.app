import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import migration0001 from "@/db/migrations/0001_legal_solo.sql?raw";
import {
  user as authUser,
  dhikrDaily,
  prayerLogs,
  session as sessionTable,
  shieldSelection,
  subscriptions,
  userAchievements,
  users,
} from "@/db/schema";

import {
  deleteMyAccount,
  getAvatarObject,
  getProfile,
  setAvatar,
  upsertProfile,
} from "./users.service";

async function applyMigrations() {
  for (const sql of [migration0000, migration0001]) {
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await env.DB.prepare(statement).run();
    }
  }
}

beforeAll(applyMigrations);

describe("users service — profile", () => {
  it("upserts a profile and validates the name length", async () => {
    const db = createDatabase(env.DB);
    const user = "profile-user";
    const row = await upsertProfile(db, user, {
      name: "Sana",
      completedAt: new Date().toISOString(),
    });
    expect(row.name).toBe("Sana");

    await expect(
      upsertProfile(db, user, { name: "x".repeat(200) })
    ).rejects.toThrow("name exceeds");
  });
});

describe("users service — account deletion (P0)", () => {
  it("purges every user-keyed row, the avatar blob, and the Better Auth identity", async () => {
    const db = createDatabase(env.DB);
    const user = "delete-me";
    const email = "delete@example.com";
    const now = Date.now();

    // Better Auth identity + a session.
    await db.insert(authUser).values({
      id: user,
      name: "Doomed",
      email,
      emailVerified: true,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    });
    await db.insert(sessionTable).values({
      id: "sess-1",
      token: "tok-1",
      userId: user,
      expiresAt: new Date(now + 1000),
      createdAt: new Date(now),
      updatedAt: new Date(now),
    });

    // App data across several tables + an avatar blob.
    await env.R2.put("avatars/delete-me.jpg", "binary");
    await upsertProfile(db, user, { image: "avatars/delete-me.jpg" } as never);
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      authUserId: user,
      customerEmail: email,
      productId: "yearly",
      status: "active",
      source: "polar",
      updatedAt: new Date().toISOString(),
    });
    await db.insert(prayerLogs).values({
      id: crypto.randomUUID(),
      authUserId: user,
      date: "2026-06-08",
      prayer: "fajr",
      status: "on_time",
      updatedAt: now,
    });
    await db.insert(shieldSelection).values({
      id: crypto.randomUUID(),
      authUserId: user,
      windows: ["fajr"],
      enabled: true,
      updatedAt: now,
    });
    await db.insert(dhikrDaily).values({
      id: crypto.randomUUID(),
      authUserId: user,
      date: "2026-06-08",
      count: 5,
      target: 33,
      updatedAt: now,
    });
    await db.insert(userAchievements).values({
      id: crypto.randomUUID(),
      authUserId: user,
      code: "first_steps",
      unlockedAt: now,
    });

    await deleteMyAccount(db, env.R2, user, email);

    // Zero rows for the deleted user in every table.
    const counts = await Promise.all([
      db.select().from(users).where(eq(users.authUserId, user)),
      db.select().from(subscriptions).where(eq(subscriptions.authUserId, user)),
      db.select().from(prayerLogs).where(eq(prayerLogs.authUserId, user)),
      db
        .select()
        .from(shieldSelection)
        .where(eq(shieldSelection.authUserId, user)),
      db.select().from(dhikrDaily).where(eq(dhikrDaily.authUserId, user)),
      db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.authUserId, user)),
    ]);
    for (const rows of counts) {
      expect(rows).toHaveLength(0);
    }
    // Better Auth identity + session gone.
    expect(
      await db.select().from(authUser).where(eq(authUser.id, user))
    ).toHaveLength(0);
    expect(
      await db.select().from(sessionTable).where(eq(sessionTable.userId, user))
    ).toHaveLength(0);
    // Avatar blob gone.
    expect(await env.R2.get("avatars/delete-me.jpg")).toBeNull();
    // Profile resolves to null.
    expect(await getProfile(db, user)).toBeNull();
  });
});

describe("users service — avatar", () => {
  const PNG = "image/png";

  it("stores the avatar, links it to the profile, and reads it back", async () => {
    const db = createDatabase(env.DB);
    const user = "avatar-user";
    await setAvatar(db, env.R2, user, new Uint8Array(8).buffer, PNG);

    const profile = await getProfile(db, user);
    expect(profile?.image).toBe("avatars/avatar-user");

    const obj = await getAvatarObject(db, env.R2, user);
    expect(obj).not.toBeNull();
    expect(obj?.httpMetadata?.contentType).toBe(PNG);
  });

  it("rejects a disallowed content type with a 422", async () => {
    const db = createDatabase(env.DB);
    await expect(
      setAvatar(db, env.R2, "bad-type", new Uint8Array(8).buffer, "text/html")
    ).rejects.toMatchObject({ status: 422 });
  });

  it("returns null when the user has no avatar", async () => {
    const db = createDatabase(env.DB);
    await upsertProfile(db, "no-avatar", { name: "Plain" });
    expect(await getAvatarObject(db, env.R2, "no-avatar")).toBeNull();
  });
});

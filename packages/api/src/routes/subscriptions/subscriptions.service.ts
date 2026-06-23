import {
  buildRevenueCatSubscriptionDoc,
  PRODUCT_IDS,
  type ProductId,
  type RevenueCatPeriodType,
  type RevenueCatStore,
  shouldSkipRcSync,
} from "@barakah/core/subscriptions";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { HTTPException } from "hono/http-exception";

import type { Database } from "@/db";
import { polarOrders, subscriptions } from "@/db/schema";
import type { EnvVars } from "@/env";
import { isTruthyFlag } from "@/env";
import { FORBIDDEN, UNAUTHORIZED } from "@/stoker/http-status-codes";

const REVENUECAT_PREMIUM_ENTITLEMENT = "Barakah Premium";

type SubscriptionRow = typeof subscriptions.$inferSelect;

function isExpired(expiresAt: string | null): boolean {
  return Boolean(expiresAt) && Date.parse(expiresAt as string) <= Date.now();
}

export interface SessionUser {
  email?: string | null;
  id: string;
}

// App Review demo account: when REVIEW_OTP_EMAIL is set and matches the signed-in
// user, hand back a synthetic active subscription so Apple reviewers clear the
// paywall and can test the core feature. The row is never written to the DB, so
// deleting the REVIEW_OTP_EMAIL secret instantly disables the bypass (same secret
// that gates the static sign-in OTP).
function buildReviewSubscriptionRow(user: SessionUser): SubscriptionRow {
  const now = new Date().toISOString();
  return {
    id: `review-${user.id}`,
    authUserId: user.id,
    customerEmail: user.email ?? null,
    productId: "lifetime",
    status: "active",
    source: "mock",
    claimedAt: now,
    activatedAt: now,
    updatedAt: now,
    expiresAt: null,
    polarCustomerId: null,
    polarProductId: null,
    polarOrderId: null,
    rcAppUserId: null,
    rcOriginalAppUserId: null,
    rcProductIdentifier: null,
    rcEntitlementId: null,
    rcStore: null,
    rcPeriodType: null,
    rcWillRenew: null,
    rcLatestPurchaseAt: null,
  };
}

function isReviewSubscriptionEmail(
  env: EnvVars | undefined,
  email: string | null | undefined
): boolean {
  const reviewEmail = env?.REVIEW_OTP_EMAIL;
  if (!(reviewEmail && email)) {
    return false;
  }
  return email.toLowerCase() === reviewEmail.toLowerCase();
}

export async function getMySubscription(
  db: Database,
  user: SessionUser,
  env?: EnvVars
): Promise<SubscriptionRow | null> {
  if (isReviewSubscriptionEmail(env, user.email)) {
    return buildReviewSubscriptionRow(user);
  }

  const activeRows = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.authUserId, user.id),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.updatedAt))
    .limit(20);
  // Source precedence is deterministic: an active Polar row always wins over an
  // active RevenueCat row (the invariant "RC must NOT overwrite Polar-owned"),
  // regardless of updatedAt write timing. Falls back to the most-recently
  // updated active row otherwise.
  const active =
    activeRows.find((row) => row.source === "polar") ?? activeRows[0];
  if (active) {
    return isExpired(active.expiresAt) ? null : active;
  }

  // Fallback: a web (anonymous) Polar purchase keyed only by customerEmail.
  const email = user.email?.toLowerCase().trim();
  if (!email) {
    return null;
  }
  // lower() compare: rows written before email normalization landed in
  // recordPaidOrder can carry mixed-case Polar emails.
  const byEmail = await db
    .select()
    .from(subscriptions)
    .where(sql`lower(${subscriptions.customerEmail}) = ${email}`)
    .limit(20);
  const polarRow = byEmail.find(
    (row) =>
      row.source === "polar" && row.status === "active" && !row.authUserId
  );
  if (!polarRow || isExpired(polarRow.expiresAt)) {
    return null;
  }
  return polarRow;
}

export async function claimPolarByEmail(
  db: Database,
  user: SessionUser
): Promise<{ linked: boolean }> {
  const email = user.email?.toLowerCase().trim();
  if (!email) {
    return { linked: false };
  }
  const now = new Date().toISOString();

  // lower() compare: rows written before email normalization landed in
  // recordPaidOrder can carry mixed-case Polar emails.
  const subs = await db
    .select()
    .from(subscriptions)
    .where(sql`lower(${subscriptions.customerEmail}) = ${email}`)
    .limit(20);
  const orders = await db
    .select()
    .from(polarOrders)
    .where(sql`lower(${polarOrders.customerEmail}) = ${email}`)
    .limit(20);

  // Linking the subscriptions + their orders to this user must be all-or-nothing.
  // The `authUserId IS NULL` guard on each UPDATE is optimistic locking: two
  // concurrent claims for the same email both read unclaimed rows, but only the
  // first write wins — the loser's UPDATE matches zero rows.
  const writes: BatchItem<"sqlite">[] = [];
  // Track which batch slots are subscription claims so `linked` reflects rows
  // the optimistic-locked UPDATE actually won — a concurrent claim from another
  // device can grab the row first, leaving this UPDATE matching zero rows.
  const subWriteIndexes: number[] = [];
  for (const sub of subs) {
    if (sub.source === "polar" && !sub.authUserId) {
      subWriteIndexes.push(writes.length);
      writes.push(
        db
          .update(subscriptions)
          .set({ authUserId: user.id, updatedAt: now })
          .where(
            and(eq(subscriptions.id, sub.id), isNull(subscriptions.authUserId))
          )
          .returning({ id: subscriptions.id })
      );
    }
  }
  for (const order of orders) {
    if (!order.authUserId) {
      writes.push(
        db
          .update(polarOrders)
          .set({ authUserId: user.id })
          .where(
            and(eq(polarOrders.id, order.id), isNull(polarOrders.authUserId))
          )
      );
    }
  }

  if (writes.length === 0) {
    return { linked: false };
  }

  const results = await db.batch(
    writes as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]
  );
  const linked = subWriteIndexes.some((i) => {
    const rows = results[i];
    return Array.isArray(rows) && rows.length > 0;
  });

  return { linked };
}

export async function claimMockSubscription(
  db: Database,
  env: EnvVars,
  user: SessionUser,
  productId: string
): Promise<SubscriptionRow | null> {
  if (!isTruthyFlag(env.ALLOW_MOCK_SUBSCRIPTIONS)) {
    throw new HTTPException(FORBIDDEN, {
      message: "Mock subscriptions are not allowed in this environment",
    });
  }

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.authUserId, user.id),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  if (existing) {
    if (existing.productId !== productId) {
      throw new HTTPException(FORBIDDEN, {
        message: `Active subscription already exists with product ${existing.productId}`,
      });
    }
    return existing;
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.insert(subscriptions).values({
    id,
    authUserId: user.id,
    productId: productId as SubscriptionRow["productId"],
    status: "active",
    source: "mock",
    claimedAt: now,
    updatedAt: now,
  });
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);
  return row ?? null;
}

export interface RevenueCatVerified {
  entitlementActive: boolean;
  entitlementId?: string;
  expiresAt?: string;
  latestPurchaseAt?: string;
  originalAppUserId?: string;
  periodType?: RevenueCatPeriodType;
  productIdentifier?: string;
  rcAppUserId?: string;
  store?: RevenueCatStore;
  willRenew?: boolean;
}

/**
 * Apply a verified RevenueCat entitlement. **Preserves source precedence:** if
 * the user already has an active Polar-owned subscription, RC must NOT overwrite
 * it (ports applyRevenueCatEntitlement + shouldSkipRcSync).
 */
export async function applyRevenueCatEntitlement(
  db: Database,
  authUserId: string,
  verified: RevenueCatVerified
): Promise<SubscriptionRow | null> {
  // One read of the user's rows, then evaluate both the Polar-precedence guard
  // and the existing-RC-row lookup from the same snapshot (avoids a two-select
  // inconsistency window).
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.authUserId, authUserId))
    .limit(20);
  const activePolarRow = rows.find(
    (row) =>
      row.status === "active" &&
      !isExpired(row.expiresAt) &&
      shouldSkipRcSync(row.source)
  );
  if (activePolarRow) {
    return activePolarRow;
  }

  const rcRow = rows.find((row) => row.source === "revenuecat");
  const now = new Date().toISOString();
  const existingProductId = PRODUCT_IDS.includes(rcRow?.productId as ProductId)
    ? (rcRow?.productId as ProductId)
    : undefined;
  const doc = buildRevenueCatSubscriptionDoc(
    { authUserId, ...verified },
    now,
    existingProductId,
    rcRow?.activatedAt ?? undefined
  );

  if (rcRow) {
    // UPDATE … RETURNING: one round-trip, and the caller gets the row the
    // update actually produced (a follow-up SELECT could read a stale row).
    const [updated] = await db
      .update(subscriptions)
      .set(doc)
      .where(eq(subscriptions.id, rcRow.id))
      .returning();
    return updated ?? null;
  }

  if (!verified.entitlementActive) {
    return null;
  }

  const id = crypto.randomUUID();
  await db.insert(subscriptions).values({ id, ...doc });
  const [inserted] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);
  return inserted ?? null;
}

function stringField(
  record: Record<string, unknown>,
  key: string
): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function booleanField(
  record: Record<string, unknown>,
  key: string
): boolean | undefined {
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function parseStore(value: unknown): RevenueCatStore | undefined {
  switch (value) {
    case "app_store":
    case "play_store":
    case "stripe":
    case "promotional":
    case "mac_app_store":
    case "amazon":
      return value;
    default:
      return;
  }
}

function parsePeriodType(value: unknown): RevenueCatPeriodType | undefined {
  switch (value) {
    case "normal":
    case "trial":
    case "intro":
      return value;
    default:
      return;
  }
}

export function parseRevenueCatEntitlementPayload(
  payload: unknown,
  appUserId: string
): RevenueCatVerified {
  const root = asRecord(payload);
  const subscriber = asRecord(root.subscriber);
  const entitlements = asRecord(subscriber.entitlements);
  const entitlementRaw = entitlements[REVENUECAT_PREMIUM_ENTITLEMENT];
  const entitlement =
    entitlementRaw && typeof entitlementRaw === "object"
      ? (entitlementRaw as Record<string, unknown>)
      : null;
  const expiresAt = entitlement
    ? stringField(entitlement, "expires_date")
    : undefined;
  const expiresAtMs = expiresAt
    ? Date.parse(expiresAt)
    : Number.POSITIVE_INFINITY;
  const entitlementActive =
    Boolean(entitlement) &&
    !Number.isNaN(expiresAtMs) &&
    expiresAtMs > Date.now();

  return {
    entitlementActive,
    entitlementId: REVENUECAT_PREMIUM_ENTITLEMENT,
    expiresAt,
    latestPurchaseAt: entitlement
      ? stringField(entitlement, "purchase_date")
      : undefined,
    originalAppUserId: stringField(subscriber, "original_app_user_id"),
    periodType: entitlement
      ? parsePeriodType(stringField(entitlement, "period_type"))
      : undefined,
    productIdentifier: entitlement
      ? stringField(entitlement, "product_identifier")
      : undefined,
    rcAppUserId: appUserId,
    store: entitlement
      ? parseStore(stringField(entitlement, "store"))
      : undefined,
    willRenew: entitlement
      ? booleanField(entitlement, "will_renew")
      : undefined,
  };
}

/**
 * Verify the entitlement server-side against the RevenueCat REST API (never
 * trusting the client), then apply it. Ports the `syncRevenueCatEntitlement`
 * public action.
 */
export async function syncRevenueCatEntitlement(
  db: Database,
  env: EnvVars,
  user: SessionUser
): Promise<SubscriptionRow | null> {
  const secretKey = env.REVENUECAT_SECRET_KEY;
  if (!secretKey) {
    throw new HTTPException(UNAUTHORIZED, {
      message: "REVENUECAT_SECRET_KEY is not configured",
    });
  }
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  if (!response.ok) {
    // Generic client message — the upstream RC status code would leak provider
    // behaviour (404 = unknown subscriber, 429 = RC throttled) to the caller.
    throw new HTTPException(UNAUTHORIZED, {
      message: "Subscription verification failed",
    });
  }
  const payload = await response.json();
  const verified = parseRevenueCatEntitlementPayload(payload, user.id);
  return await applyRevenueCatEntitlement(db, user.id, verified);
}

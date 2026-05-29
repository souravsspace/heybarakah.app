import { v } from "convex/values";
import {
  buildRevenueCatSubscriptionDoc,
  type RevenueCatPeriodType,
  type RevenueCatStore,
  shouldSkipRcSync,
} from "../../src/subscriptions";
import {
  productId,
  revenueCatPeriodType,
  revenueCatStore,
} from "../../src/subscriptions/validators";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import {
  action,
  internalMutation,
  mutation,
  query,
} from "../_generated/server";
import { authComponent } from "./auth";

const REVENUECAT_PREMIUM_ENTITLEMENT = "Barakah Premium";

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    // A user can briefly hold two active rows (e.g. a mock sub plus a real Polar
    // order in sandbox). Prefer the most recent active row instead of throwing.
    const row = await ctx.db
      .query("subscriptions")
      .withIndex("by_authUserId_status", (q) =>
        q.eq("authUserId", user._id).eq("status", "active")
      )
      .order("desc")
      .first();
    if (!row) {
      return null;
    }
    if (row.expiresAt && Date.parse(row.expiresAt) <= Date.now()) {
      return null;
    }
    return row;
  },
});

export const claimMockSubscription = mutation({
  args: { productId },
  handler: async (ctx, args) => {
    if (process.env.ALLOW_MOCK_SUBSCRIPTIONS !== "true") {
      throw new Error("Mock subscriptions are not allowed in this environment");
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_authUserId_status", (q) =>
        q.eq("authUserId", user._id).eq("status", "active")
      )
      .order("desc")
      .first();
    if (existing) {
      if (existing.productId !== args.productId) {
        throw new Error(
          `Active subscription already exists with product ${existing.productId}`
        );
      }
      return existing;
    }

    const now = new Date().toISOString();
    const subscriptionId = await ctx.db.insert("subscriptions", {
      authUserId: user._id,
      productId: args.productId,
      status: "active",
      source: "mock",
      claimedAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(subscriptionId);
  },
});

function parseRevenueCatStore(value: unknown): RevenueCatStore | undefined {
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

function parseRevenueCatPeriodType(
  value: unknown
): RevenueCatPeriodType | undefined {
  switch (value) {
    case "normal":
    case "trial":
    case "intro":
      return value;
    default:
      return;
  }
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

function parseRevenueCatEntitlementPayload(
  payload: unknown,
  appUserId: string
) {
  const root =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const subscriber =
    root.subscriber && typeof root.subscriber === "object"
      ? (root.subscriber as Record<string, unknown>)
      : {};
  const entitlements =
    subscriber.entitlements && typeof subscriber.entitlements === "object"
      ? (subscriber.entitlements as Record<string, unknown>)
      : {};
  const entitlement =
    entitlements[REVENUECAT_PREMIUM_ENTITLEMENT] &&
    typeof entitlements[REVENUECAT_PREMIUM_ENTITLEMENT] === "object"
      ? (entitlements[REVENUECAT_PREMIUM_ENTITLEMENT] as Record<
          string,
          unknown
        >)
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
      ? parseRevenueCatPeriodType(stringField(entitlement, "period_type"))
      : undefined,
    productIdentifier: entitlement
      ? stringField(entitlement, "product_identifier")
      : undefined,
    rcAppUserId: appUserId,
    store: entitlement
      ? parseRevenueCatStore(stringField(entitlement, "store"))
      : undefined,
    willRenew: entitlement
      ? booleanField(entitlement, "will_renew")
      : undefined,
  };
}

export const syncRevenueCatEntitlement: ReturnType<typeof action> = action({
  args: {
    entitlementActive: v.boolean(),
    productIdentifier: v.optional(v.string()),
    entitlementId: v.optional(v.string()),
    store: v.optional(revenueCatStore),
    periodType: v.optional(revenueCatPeriodType),
    willRenew: v.optional(v.boolean()),
    rcAppUserId: v.optional(v.string()),
    originalAppUserId: v.optional(v.string()),
    latestPurchaseAt: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, _args): Promise<Doc<"subscriptions"> | null> => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const secretKey = process.env.REVENUECAT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("REVENUECAT_SECRET_KEY is not configured");
    }
    const appUserId = user._id;
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    if (!response.ok) {
      throw new Error(`RevenueCat subscriber fetch failed: ${response.status}`);
    }
    const payload = await response.json();
    const verified = parseRevenueCatEntitlementPayload(payload, appUserId);
    return await ctx.runMutation(
      internal.lib.subscriptions.applyRevenueCatEntitlement,
      { authUserId: user._id, ...verified }
    );
  },
});

export const applyRevenueCatEntitlement = internalMutation({
  args: {
    authUserId: v.string(),
    entitlementActive: v.boolean(),
    productIdentifier: v.optional(v.string()),
    entitlementId: v.optional(v.string()),
    store: v.optional(revenueCatStore),
    periodType: v.optional(revenueCatPeriodType),
    willRenew: v.optional(v.boolean()),
    rcAppUserId: v.optional(v.string()),
    originalAppUserId: v.optional(v.string()),
    latestPurchaseAt: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", args.authUserId))
      .take(20);

    const polarRow = existing.find((row) => shouldSkipRcSync(row.source));
    if (polarRow && polarRow.status === "active") {
      return polarRow;
    }

    const rcRow = existing.find((row) => row.source === "revenuecat");
    const now = new Date().toISOString();
    const doc = buildRevenueCatSubscriptionDoc(
      {
        authUserId: args.authUserId,
        entitlementActive: args.entitlementActive,
        productIdentifier: args.productIdentifier,
        entitlementId: args.entitlementId,
        store: args.store,
        periodType: args.periodType,
        willRenew: args.willRenew,
        rcAppUserId: args.rcAppUserId,
        originalAppUserId: args.originalAppUserId,
        latestPurchaseAt: args.latestPurchaseAt,
        expiresAt: args.expiresAt,
      },
      now,
      rcRow?.productId
    );

    if (rcRow) {
      await ctx.db.patch(rcRow._id, doc);
      return await ctx.db.get(rcRow._id);
    }

    if (!args.entitlementActive) {
      return null;
    }

    const id = await ctx.db.insert("subscriptions", doc);
    return await ctx.db.get(id);
  },
});

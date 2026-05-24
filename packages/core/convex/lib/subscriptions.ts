import { v } from "convex/values";
import {
  buildRevenueCatSubscriptionDoc,
  shouldSkipRcSync,
} from "../../src/subscriptions";
import {
  productId,
  revenueCatPeriodType,
  revenueCatStore,
} from "../../src/subscriptions/validators";
import { mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    const row = await ctx.db
      .query("subscriptions")
      .withIndex("by_authUserId_status", (q) =>
        q.eq("authUserId", user._id).eq("status", "active")
      )
      .unique();
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
      .unique();
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

export const syncRevenueCatEntitlement = mutation({
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
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .take(20);

    const polarRow = existing.find((row) => shouldSkipRcSync(row.source));
    if (polarRow && polarRow.status === "active") {
      return polarRow;
    }

    const rcRow = existing.find((row) => row.source === "revenuecat");
    const now = new Date().toISOString();
    const doc = buildRevenueCatSubscriptionDoc(
      {
        authUserId: user._id,
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

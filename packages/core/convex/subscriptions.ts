import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const productId = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("family")
);

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_authUserId_status", (q) =>
        q.eq("authUserId", user._id).eq("status", "active")
      )
      .unique();
  },
});

export const claimMockSubscription = mutation({
  args: { productId },
  handler: async (ctx, args) => {
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
      return existing;
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      authUserId: user._id,
      productId: args.productId,
      status: "active",
      source: "mock",
      claimedAt: new Date().toISOString(),
    });

    return await ctx.db.get(subscriptionId);
  },
});

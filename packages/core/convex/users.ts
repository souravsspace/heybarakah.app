import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const profileFields = {
  name: v.optional(v.string()),
  gender: v.optional(v.string()),
  madhab: v.optional(v.string()),
  consistency: v.optional(v.string()),
  struggle: v.optional(v.string()),
  goal: v.optional(v.string()),
  calcMethod: v.optional(v.string()),
  strictness: v.optional(v.string()),
  plan: v.optional(v.string()),
  trialStartedAt: v.optional(v.string()),
  locationGranted: v.optional(v.boolean()),
  notifGranted: v.optional(v.boolean()),
  prayersToLock: v.optional(
    v.object({
      fajr: v.boolean(),
      dhuhr: v.boolean(),
      asr: v.boolean(),
      maghrib: v.boolean(),
      isha: v.boolean(),
    })
  ),
  completedAt: v.optional(v.string()),
};

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
  },
});

export const upsertProfile = mutation({
  args: profileFields,
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("users", { authUserId: user._id, ...args });
  },
});

import { v } from "convex/values";
import {
  profileFields,
  validateProfileInput,
} from "../../src/users/validators";
import { internal } from "../_generated/api";
import type { Id, TableNames } from "../_generated/dataModel";
import { internalMutation, mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

// Account = auth user + in-app profile resolved in a single auth pass. The
// login gate and every screen read this through one shared subscription instead
// of each re-resolving the Better Auth user. The avatar signed URL is split out
// to `getMyAvatarUrl` so this gate-critical query never pays a storage round
// trip; `profile` is the raw `users` row (or null before onboarding).
export const getMyAccount = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
    return { user, profile };
  },
});

export const getMyAvatarUrl = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
    return profile?.image ? await ctx.storage.getUrl(profile.image) : null;
  },
});

export const upsertProfile = mutation({
  args: profileFields,
  handler: async (ctx, args) => {
    validateProfileInput(args);
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
    let resultId: Id<"users">;
    if (existing) {
      await ctx.db.patch(existing._id, args);
      resultId = existing._id;
    } else {
      resultId = await ctx.db.insert("users", {
        authUserId: user._id,
        ...args,
      });
    }
    await ctx.scheduler.runAfter(0, internal.lib.achievements.runEvaluate, {
      authUserId: user._id,
    });
    return resultId;
  },
});

// Max rows removed per purge invocation. Convex caps a mutation at 8,192 doc
// reads/writes; a long-tenured user can exceed that across all their tables, so
// the purge runs in bounded batches and reschedules itself until drained.
const PURGE_BATCH = 1000;

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const authUserId = user._id;
    const email = user.email ?? null;

    // Remove the profile row (and avatar) synchronously so getMyProfile flips to
    // null immediately and app gating reacts. The bulk of the data is drained by
    // a scheduled internal job that survives session/auth teardown.
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
      .unique();
    if (profile?.image) {
      await ctx.storage.delete(profile.image);
    }
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    await ctx.scheduler.runAfter(0, internal.lib.users.purgeUserData, {
      authUserId,
      email,
    });
  },
});

export const purgeUserData = internalMutation({
  args: { authUserId: v.string(), email: v.union(v.string(), v.null()) },
  handler: async (ctx, { authUserId, email }) => {
    let budget = PURGE_BATCH;
    const drain = async (rows: { _id: Id<TableNames> }[]) => {
      for (const row of rows) {
        await ctx.db.delete(row._id);
        budget -= 1;
      }
    };

    if (budget > 0) {
      await drain(
        await ctx.db
          .query("users")
          .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    // Each table is queried after the previous deletions commit, so an
    // email-keyed subscription that also had authUserId is already gone — no
    // double-delete despite the overlapping indexes.
    if (budget > 0 && email) {
      await drain(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_customerEmail", (q) => q.eq("customerEmail", email))
          .take(budget)
      );
    }
    if (budget > 0 && email) {
      await drain(
        await ctx.db
          .query("polarOrders")
          .withIndex("by_customerEmail", (q) => q.eq("customerEmail", email))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("prayerLogs")
          .withIndex("by_user_updated", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("shieldSelection")
          .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("dhikrDaily")
          .withIndex("by_user_date", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("dhikrAggregate")
          .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("userLocations")
          .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("userAchievements")
          .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("userAchievementCounters")
          .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
          .take(budget)
      );
    }
    if (budget > 0) {
      await drain(
        await ctx.db
          .query("prayerTimeCaches")
          .withIndex("by_userId", (q) => q.eq("userId", authUserId))
          .take(budget)
      );
    }

    // Budget exhausted means more rows may remain — continue on a fresh
    // transaction. A trailing empty run is harmless and ends the chain.
    if (budget <= 0) {
      await ctx.scheduler.runAfter(0, internal.lib.users.purgeUserData, {
        authUserId,
        email,
      });
    }
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
    if (existing?.image && existing.image !== args.storageId) {
      await ctx.storage.delete(existing.image);
    }
    if (existing) {
      await ctx.db.patch(existing._id, { image: args.storageId });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      authUserId: user._id,
      image: args.storageId,
    });
  },
});

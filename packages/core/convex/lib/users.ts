import { v } from "convex/values";
import {
  profileFields,
  validateProfileInput,
} from "../../src/users/validators";
import { internal } from "../_generated/api";
import type { Doc, Id, TableNames } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

export const getMyProfile = query({
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
    if (!profile) {
      return null;
    }
    const imageUrl = profile.image
      ? await ctx.storage.getUrl(profile.image)
      : null;
    return { ...profile, imageUrl };
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

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const authUserId = user._id;
    const email = user.email ?? null;

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
      .unique();
    if (profile?.image) {
      await ctx.storage.delete(profile.image);
    }

    const deleteAll = async <T extends TableNames>(rows: Doc<T>[]) => {
      for (const row of rows) {
        await ctx.db.delete(row._id);
      }
    };

    await deleteAll(
      await ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    // A claimed Polar sub carries both authUserId and customerEmail, so the two
    // index lookups can return the same row. Dedupe by _id before deleting —
    // deleting an already-removed document throws and aborts the whole mutation.
    const subIds = new Set<Id<"subscriptions">>(
      (
        await ctx.db
          .query("subscriptions")
          .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
          .collect()
      ).map((row) => row._id)
    );
    if (email) {
      for (const row of await ctx.db
        .query("subscriptions")
        .withIndex("by_customerEmail", (q) => q.eq("customerEmail", email))
        .collect()) {
        subIds.add(row._id);
      }
    }
    for (const id of subIds) {
      await ctx.db.delete(id);
    }
    if (email) {
      await deleteAll(
        await ctx.db
          .query("polarOrders")
          .withIndex("by_customerEmail", (q) => q.eq("customerEmail", email))
          .collect()
      );
    }
    await deleteAll(
      await ctx.db
        .query("prayerLogs")
        .withIndex("by_user_updated", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("shieldSelection")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("dhikrDaily")
        .withIndex("by_user_date", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("dhikrAggregate")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("userLocations")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("userAchievementCounters")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .collect()
    );
    await deleteAll(
      await ctx.db
        .query("prayerTimeCaches")
        .withIndex("by_userId", (q) => q.eq("userId", authUserId))
        .collect()
    );
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

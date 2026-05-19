import { v } from "convex/values";
import {
  profileFields,
  validateProfileInput,
} from "../../src/users/validators";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
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

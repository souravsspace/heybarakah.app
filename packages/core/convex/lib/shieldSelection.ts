import { v } from "convex/values";
import {
  ALL_WINDOWS,
  prayerWindow,
} from "../../src/shieldSelection/validators";
import { mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

const DEFAULT_WINDOWS = [...ALL_WINDOWS];

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }
    return await ctx.db
      .query("shieldSelection")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .unique();
  },
});

export const upsertIos = mutation({
  args: {
    iosSelectionData: v.string(),
    iosItemCount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("shieldSelection")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        iosSelectionData: args.iosSelectionData,
        iosItemCount: args.iosItemCount,
        enabled: args.iosItemCount > 0,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("shieldSelection", {
      authUserId: user._id,
      iosSelectionData: args.iosSelectionData,
      iosItemCount: args.iosItemCount,
      windows: DEFAULT_WINDOWS,
      enabled: args.iosItemCount > 0,
      updatedAt: now,
    });
  },
});

export const upsertAndroid = mutation({
  args: { androidPackageNames: v.array(v.string()) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("shieldSelection")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        androidPackageNames: args.androidPackageNames,
        enabled: args.androidPackageNames.length > 0,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("shieldSelection", {
      authUserId: user._id,
      androidPackageNames: args.androidPackageNames,
      windows: DEFAULT_WINDOWS,
      enabled: args.androidPackageNames.length > 0,
      updatedAt: now,
    });
  },
});

export const setWindows = mutation({
  args: { windows: v.array(prayerWindow) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("shieldSelection")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .unique();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, {
      windows: args.windows,
      updatedAt: Date.now(),
    });
  },
});

export const setEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("shieldSelection")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .unique();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, {
      enabled: args.enabled,
      updatedAt: Date.now(),
    });
  },
});

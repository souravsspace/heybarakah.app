import { v } from "convex/values";
import { CATALOG_BY_ID } from "../../src/lockedApps/catalog";
import { ALL_WINDOWS, prayerWindow } from "../../src/lockedApps/validators";
import { mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("lockedApps")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .collect();
  },
});

export const addApp = mutation({
  args: {
    appId: v.string(),
    windows: v.optional(v.array(prayerWindow)),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const meta = CATALOG_BY_ID[args.appId];
    if (!meta) {
      throw new Error(`Unknown app: ${args.appId}`);
    }
    const existing = await ctx.db
      .query("lockedApps")
      .withIndex("by_user_app", (q) =>
        q.eq("authUserId", user._id).eq("appId", args.appId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: true,
        windows: args.windows ?? existing.windows,
      });
      return existing._id;
    }
    return await ctx.db.insert("lockedApps", {
      authUserId: user._id,
      appId: meta.appId,
      name: meta.name,
      bundleId: meta.bundleId,
      scheme: meta.scheme,
      installed: false,
      enabled: true,
      windows: args.windows ?? [...ALL_WINDOWS],
      addedAt: Date.now(),
    });
  },
});

export const removeApp = mutation({
  args: { appId: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("lockedApps")
      .withIndex("by_user_app", (q) =>
        q.eq("authUserId", user._id).eq("appId", args.appId)
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const setEnabled = mutation({
  args: { appId: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("lockedApps")
      .withIndex("by_user_app", (q) =>
        q.eq("authUserId", user._id).eq("appId", args.appId)
      )
      .unique();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, { enabled: args.enabled });
  },
});

export const setWindows = mutation({
  args: { appId: v.string(), windows: v.array(prayerWindow) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("lockedApps")
      .withIndex("by_user_app", (q) =>
        q.eq("authUserId", user._id).eq("appId", args.appId)
      )
      .unique();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, { windows: args.windows });
  },
});

export const syncInstalled = mutation({
  args: {
    apps: v.array(v.object({ appId: v.string(), installed: v.boolean() })),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const rows = await ctx.db
      .query("lockedApps")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .collect();
    const byAppId = new Map(rows.map((r) => [r.appId, r]));
    for (const probe of args.apps) {
      const row = byAppId.get(probe.appId);
      if (row && row.installed !== probe.installed) {
        await ctx.db.patch(row._id, { installed: probe.installed });
      }
    }
  },
});

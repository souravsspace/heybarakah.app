import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";

export const getAppConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("appConfig").first();
    if (!config) {
      return null;
    }
    return {
      minSupportedVersion: config.minSupportedVersion,
      iosStoreUrl: config.iosStoreUrl,
    };
  },
});

export const setAppConfig = internalMutation({
  args: {
    minSupportedVersion: v.string(),
    iosStoreUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("appConfig").first();
    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt });
      return existing._id;
    }
    return await ctx.db.insert("appConfig", { ...args, updatedAt });
  },
});

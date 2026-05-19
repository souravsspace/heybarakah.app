import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TARGET = 33;
const MAX_TARGET = 10_000;
const MAX_INCREMENT = 1000;

export const getToday = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    if (!DATE_KEY_PATTERN.test(date)) {
      throw new Error("Invalid date");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { count: 0, target: DEFAULT_TARGET };
    }
    const row = await ctx.db
      .query("dhikrDaily")
      .withIndex("by_user_date", (q) =>
        q.eq("authUserId", user._id).eq("date", date)
      )
      .unique();
    if (!row) {
      return { count: 0, target: DEFAULT_TARGET };
    }
    return { count: row.count, target: row.target };
  },
});

export const increment = mutation({
  args: { date: v.string(), by: v.optional(v.number()) },
  handler: async (ctx, { date, by }) => {
    if (!DATE_KEY_PATTERN.test(date)) {
      throw new Error("Invalid date");
    }
    const delta = by ?? 1;
    if (!Number.isInteger(delta) || delta < 1 || delta > MAX_INCREMENT) {
      throw new Error("Invalid increment");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("dhikrDaily")
      .withIndex("by_user_date", (q) =>
        q.eq("authUserId", user._id).eq("date", date)
      )
      .unique();
    let nextCount: number;
    if (existing) {
      nextCount = existing.count + delta;
      await ctx.db.patch(existing._id, { count: nextCount, updatedAt: now });
    } else {
      await ctx.db.insert("dhikrDaily", {
        authUserId: user._id,
        date,
        count: delta,
        target: DEFAULT_TARGET,
        updatedAt: now,
      });
      nextCount = delta;
    }
    await ctx.scheduler.runAfter(0, internal.lib.achievements.runEvaluate, {
      authUserId: user._id,
      today: date,
    });
    return nextCount;
  },
});

export const setTarget = mutation({
  args: { date: v.string(), target: v.number() },
  handler: async (ctx, { date, target }) => {
    if (!DATE_KEY_PATTERN.test(date)) {
      throw new Error("Invalid date");
    }
    if (!Number.isInteger(target) || target < 1 || target > MAX_TARGET) {
      throw new Error("Invalid target");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("dhikrDaily")
      .withIndex("by_user_date", (q) =>
        q.eq("authUserId", user._id).eq("date", date)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { target, updatedAt: now });
      return null;
    }
    await ctx.db.insert("dhikrDaily", {
      authUserId: user._id,
      date,
      count: 0,
      target,
      updatedAt: now,
    });
    return null;
  },
});

export const reset = mutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    if (!DATE_KEY_PATTERN.test(date)) {
      throw new Error("Invalid date");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("dhikrDaily")
      .withIndex("by_user_date", (q) =>
        q.eq("authUserId", user._id).eq("date", date)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { count: 0, updatedAt: Date.now() });
    }
    return null;
  },
});

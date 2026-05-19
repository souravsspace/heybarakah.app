import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const prayerLiteral = v.union(
  v.literal("fajr"),
  v.literal("dhuhr"),
  v.literal("asr"),
  v.literal("maghrib"),
  v.literal("isha")
);

const statusLiteral = v.union(
  v.literal("on_time"),
  v.literal("late"),
  v.literal("qada"),
  v.literal("missed")
);

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export const getMyWeek = query({
  args: { startDate: v.string() },
  handler: async (ctx, { startDate }) => {
    if (!DATE_KEY_PATTERN.test(startDate)) {
      throw new Error("Invalid startDate");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }
    const endDate = addDays(startDate, 6);
    return await ctx.db
      .query("prayerLogs")
      .withIndex("by_user_date_prayer", (q) =>
        q.eq("authUserId", user._id).gte("date", startDate).lte("date", endDate)
      )
      .collect();
  },
});

export const logPrayer = mutation({
  args: {
    date: v.string(),
    prayer: prayerLiteral,
    status: statusLiteral,
    prayedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!DATE_KEY_PATTERN.test(args.date)) {
      throw new Error("Invalid date");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("prayerLogs")
      .withIndex("by_user_date_prayer", (q) =>
        q
          .eq("authUserId", user._id)
          .eq("date", args.date)
          .eq("prayer", args.prayer)
      )
      .unique();
    let resultId: Id<"prayerLogs">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        prayedAt: args.prayedAt,
        updatedAt: now,
      });
      resultId = existing._id;
    } else {
      resultId = await ctx.db.insert("prayerLogs", {
        authUserId: user._id,
        date: args.date,
        prayer: args.prayer,
        status: args.status,
        prayedAt: args.prayedAt,
        updatedAt: now,
      });
    }
    await ctx.scheduler.runAfter(0, internal.lib.achievements.runEvaluate, {
      authUserId: user._id,
      today: args.date,
    });
    return resultId;
  },
});

const STREAK_MAX_LOOKBACK = 365;
const ALL_FIVE = 5;
const STREAK_COUNTABLE_STATUSES = new Set(["on_time", "late", "qada"]);

export const getStreak = query({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    if (!DATE_KEY_PATTERN.test(today)) {
      throw new Error("Invalid today");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { days: 0, asOf: today };
    }
    const startDate = addDays(today, -STREAK_MAX_LOOKBACK);
    const logs = await ctx.db
      .query("prayerLogs")
      .withIndex("by_user_date_prayer", (q) =>
        q.eq("authUserId", user._id).gte("date", startDate).lte("date", today)
      )
      .collect();
    const byDate = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!STREAK_COUNTABLE_STATUSES.has(log.status)) {
        continue;
      }
      const set = byDate.get(log.date) ?? new Set<string>();
      set.add(log.prayer);
      byDate.set(log.date, set);
    }
    const isComplete = (d: string) => (byDate.get(d)?.size ?? 0) >= ALL_FIVE;
    let days = isComplete(today) ? 1 : 0;
    let cursor = addDays(today, -1);
    for (let i = 0; i < STREAK_MAX_LOOKBACK; i++) {
      if (!isComplete(cursor)) {
        break;
      }
      days++;
      cursor = addDays(cursor, -1);
    }
    return { days, asOf: today };
  },
});

export const clearPrayer = mutation({
  args: { date: v.string(), prayer: prayerLiteral },
  handler: async (ctx, args) => {
    if (!DATE_KEY_PATTERN.test(args.date)) {
      throw new Error("Invalid date");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("prayerLogs")
      .withIndex("by_user_date_prayer", (q) =>
        q
          .eq("authUserId", user._id)
          .eq("date", args.date)
          .eq("prayer", args.prayer)
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

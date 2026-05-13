import { v } from "convex/values";
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
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        prayedAt: args.prayedAt,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("prayerLogs", {
      authUserId: user._id,
      date: args.date,
      prayer: args.prayer,
      status: args.status,
      prayedAt: args.prayedAt,
      updatedAt: now,
    });
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

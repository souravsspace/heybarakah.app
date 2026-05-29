import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
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
  v.literal("early"),
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

function validateDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new ConvexError("invalid date");
  }
  const d = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateKey) {
    throw new ConvexError("invalid date");
  }
}

export const getMyWeek = query({
  args: { startDate: v.string() },
  handler: async (ctx, { startDate }) => {
    validateDateKey(startDate);
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
    validateDateKey(args.date);
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
      const previous = prayerCounterDelta(existing);
      const next = prayerCounterDelta(args);
      await ctx.db.patch(existing._id, {
        status: args.status,
        prayedAt: args.prayedAt,
        updatedAt: now,
      });
      await applyPrayerCounterDelta(ctx, user._id, {
        countablePrayerLogs:
          next.countablePrayerLogs - previous.countablePrayerLogs,
        fajrOnTimePrayerLogs:
          next.fajrOnTimePrayerLogs - previous.fajrOnTimePrayerLogs,
        onTimePrayerLogs: next.onTimePrayerLogs - previous.onTimePrayerLogs,
        qadaPrayerLogs: next.qadaPrayerLogs - previous.qadaPrayerLogs,
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
      await applyPrayerCounterDelta(ctx, user._id, prayerCounterDelta(args));
    }
    await ctx.scheduler.runAfter(0, internal.lib.achievements.runEvaluate, {
      authUserId: user._id,
      today: args.date,
    });
    return resultId;
  },
});

// Matches MAX_STREAK_LOOKBACK_DAYS in src/achievements/evaluate.ts so the
// displayed streak length never caps below what achievement unlocking counts.
const STREAK_MAX_LOOKBACK = 800;
const STREAK_HISTORY_DAYS = 28;
const ALL_FIVE = 5;
const STREAK_COUNTABLE_STATUSES = new Set(["on_time", "late", "qada"]);

interface PrayerCounterLog {
  prayer: "asr" | "dhuhr" | "fajr" | "isha" | "maghrib";
  status: "early" | "late" | "missed" | "on_time" | "qada";
}

function prayerCounterDelta(log: PrayerCounterLog) {
  return {
    countablePrayerLogs: STREAK_COUNTABLE_STATUSES.has(log.status) ? 1 : 0,
    fajrOnTimePrayerLogs:
      log.prayer === "fajr" && log.status === "on_time" ? 1 : 0,
    onTimePrayerLogs: log.status === "on_time" ? 1 : 0,
    qadaPrayerLogs: log.status === "qada" ? 1 : 0,
  };
}

async function applyPrayerCounterDelta(
  ctx: MutationCtx,
  authUserId: string,
  delta: ReturnType<typeof prayerCounterDelta>
) {
  const existing = await ctx.db
    .query("userAchievementCounters")
    .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
    .unique();
  const now = Date.now();
  if (!existing) {
    await ctx.db.insert("userAchievementCounters", {
      authUserId,
      countablePrayerLogs: Math.max(0, delta.countablePrayerLogs),
      fajrOnTimePrayerLogs: Math.max(0, delta.fajrOnTimePrayerLogs),
      onTimePrayerLogs: Math.max(0, delta.onTimePrayerLogs),
      qadaPrayerLogs: Math.max(0, delta.qadaPrayerLogs),
      updatedAt: now,
    });
    return;
  }
  await ctx.db.patch(existing._id, {
    countablePrayerLogs: Math.max(
      0,
      existing.countablePrayerLogs + delta.countablePrayerLogs
    ),
    fajrOnTimePrayerLogs: Math.max(
      0,
      existing.fajrOnTimePrayerLogs + delta.fajrOnTimePrayerLogs
    ),
    onTimePrayerLogs: Math.max(
      0,
      existing.onTimePrayerLogs + delta.onTimePrayerLogs
    ),
    qadaPrayerLogs: Math.max(0, existing.qadaPrayerLogs + delta.qadaPrayerLogs),
    updatedAt: now,
  });
}

export const getStreak = query({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    validateDateKey(today);
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return {
        days: 0,
        best: 0,
        history: Array.from({ length: STREAK_HISTORY_DAYS }, () => 0),
        todayDone: 0,
        asOf: today,
      };
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

    // Longest consecutive complete-day run across the lookback window.
    let best = days;
    let run = 0;
    for (let i = STREAK_MAX_LOOKBACK; i >= 0; i--) {
      if (isComplete(addDays(today, -i))) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }

    // Last STREAK_HISTORY_DAYS days, oldest first, as 1 (all five) or 0.
    const history: number[] = [];
    for (let i = STREAK_HISTORY_DAYS - 1; i >= 0; i--) {
      history.push(isComplete(addDays(today, -i)) ? 1 : 0);
    }

    const todayDone = Math.min(ALL_FIVE, byDate.get(today)?.size ?? 0);

    return { days, best, history, todayDone, asOf: today };
  },
});

export const clearPrayer = mutation({
  args: { date: v.string(), prayer: prayerLiteral },
  handler: async (ctx, args) => {
    validateDateKey(args.date);
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
      const previous = prayerCounterDelta(existing);
      await applyPrayerCounterDelta(ctx, user._id, {
        countablePrayerLogs: -previous.countablePrayerLogs,
        fajrOnTimePrayerLogs: -previous.fajrOnTimePrayerLogs,
        onTimePrayerLogs: -previous.onTimePrayerLogs,
        qadaPrayerLogs: -previous.qadaPrayerLogs,
      });
    }
    return null;
  },
});

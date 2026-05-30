import {
  ACHIEVEMENTS,
  type AchievementCode,
  type AchievementEvaluation,
  evaluateAchievements,
  evaluateAllProgress,
} from "@barakah/core/achievements";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { internalMutation, mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TIMEZONE = "UTC";
const LIST_PRAYER_LOG_LIMIT = 1000;
// Lifetime achievements (ramadan_complete, fajr_100, comebacks, jumuah_*) scan the
// full history, so we can't date-bound here without breaking unlocks. Cap instead at
// a value well above realistic lifetime usage (~2.7 years of 5 prayers/day) so a
// pathological row count can't blow the mutation's read limit/timeout.
const EVALUATE_PRAYER_LOG_LIMIT = 5000;
const EVALUATE_DHIKR_DAILY_LIMIT = 10_000;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function utcToday(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function localToday(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      timeZone: timezone,
      year: "numeric",
    }).formatToParts(new Date());
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    return utcToday();
  }
  return utcToday();
}

function counterProgress(
  current: number,
  target: number,
  unit: string
): AchievementEvaluation {
  return {
    progress: { current: Math.min(current, target), target, unit },
    unlocked: current >= target,
  };
}

async function latestPrayerTimezone(
  ctx: QueryCtx | MutationCtx,
  authUserId: string
): Promise<string> {
  const latest = await ctx.db
    .query("prayerTimeCaches")
    .withIndex("by_user_updated", (q) => q.eq("userId", authUserId))
    .order("desc")
    .first();
  return latest?.timezone ?? DEFAULT_TIMEZONE;
}

async function dhikrTotalForUser(
  ctx: QueryCtx | MutationCtx,
  authUserId: string
): Promise<number> {
  const aggregate = await ctx.db
    .query("dhikrAggregate")
    .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
    .unique();
  if (aggregate) {
    return aggregate.total;
  }
  const rows = await ctx.db
    .query("dhikrDaily")
    .withIndex("by_user_date", (q) => q.eq("authUserId", authUserId))
    .take(EVALUATE_DHIKR_DAILY_LIMIT);
  return rows.reduce((sum, row) => sum + row.count, 0);
}

export const runEvaluate = internalMutation({
  args: { authUserId: v.string(), today: v.optional(v.string()) },
  handler: async (ctx, { authUserId, today }) => {
    const timezone = await latestPrayerTimezone(ctx, authUserId);
    const dateKey =
      today && DATE_KEY_PATTERN.test(today) ? today : localToday(timezone);

    const [prayerLogs, dhikrTotal, profile, existing] = await Promise.all([
      ctx.db
        .query("prayerLogs")
        .withIndex("by_user_updated", (q) => q.eq("authUserId", authUserId))
        .take(EVALUATE_PRAYER_LOG_LIMIT),
      dhikrTotalForUser(ctx, authUserId),
      ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
        .unique(),
      ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .take(ACHIEVEMENTS.length + 10),
    ]);

    const alreadyUnlocked = new Set<AchievementCode>(
      existing.map((row) => row.code as AchievementCode)
    );

    const newly = evaluateAchievements(
      {
        onboardingComplete: Boolean(profile?.completedAt),
        prayerLogs: prayerLogs.map((l) => ({
          date: l.date,
          prayer: l.prayer,
          status: l.status,
          prayedAt: l.prayedAt,
          updatedAt: l.updatedAt,
        })),
        dhikrTotal,
        today: dateKey,
        timezone,
      },
      alreadyUnlocked
    );

    if (newly.length === 0) {
      return [];
    }
    const now = Date.now();
    const inserted: AchievementCode[] = [];
    for (const code of newly) {
      const dup = await ctx.db
        .query("userAchievements")
        .withIndex("by_user_code", (q) =>
          q.eq("authUserId", authUserId).eq("code", code)
        )
        .unique();
      if (dup) {
        continue;
      }
      await ctx.db.insert("userAchievements", {
        authUserId,
        code,
        unlockedAt: now,
      });
      inserted.push(code);
    }
    return inserted;
  },
});

export const listForMe = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return {
        items: ACHIEVEMENTS.map((a) => ({
          ...a,
          unlockedAt: null as number | null,
          progress: null as {
            current: number;
            target: number;
            unit: string;
          } | null,
        })),
        unlockedCount: 0,
        totalCount: ACHIEVEMENTS.length,
      };
    }
    const timezone = await latestPrayerTimezone(ctx, user._id);
    const dateKey = localToday(timezone);
    const [rows, prayerLogs, counters, dhikrTotal, profile] = await Promise.all(
      [
        ctx.db
          .query("userAchievements")
          .withIndex("by_user", (q) => q.eq("authUserId", user._id))
          .collect(),
        ctx.db
          .query("prayerLogs")
          .withIndex("by_user_updated", (q) => q.eq("authUserId", user._id))
          .order("desc")
          .take(LIST_PRAYER_LOG_LIMIT),
        ctx.db
          .query("userAchievementCounters")
          .withIndex("by_user", (q) => q.eq("authUserId", user._id))
          .unique(),
        dhikrTotalForUser(ctx, user._id),
        ctx.db
          .query("users")
          .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
          .unique(),
      ]
    );
    const byCode = new Map(rows.map((r) => [r.code, r]));
    const alreadyUnlocked = new Set<AchievementCode>(
      rows.map((r) => r.code as AchievementCode)
    );
    const evaluations = evaluateAllProgress(
      {
        onboardingComplete: Boolean(profile?.completedAt),
        prayerLogs: prayerLogs.map((l) => ({
          date: l.date,
          prayer: l.prayer,
          status: l.status,
          prayedAt: l.prayedAt,
          updatedAt: l.updatedAt,
        })),
        dhikrTotal,
        today: dateKey,
        timezone,
      },
      alreadyUnlocked
    );
    // User achievement counters are lazy-built from new prayer log writes only;
    // existing users start at 0 until they log again, with no backfill.
    if (counters) {
      evaluations.first_log = { unlocked: counters.countablePrayerLogs > 0 };
      evaluations.first_on_time = { unlocked: counters.onTimePrayerLogs > 0 };
      evaluations.fajr_100 = counterProgress(
        counters.fajrOnTimePrayerLogs,
        100,
        "Fajr"
      );
      evaluations.qada_first = { unlocked: counters.qadaPrayerLogs > 0 };
      evaluations.qada_seven = counterProgress(
        counters.qadaPrayerLogs,
        7,
        "qadā"
      );
    }
    const items = ACHIEVEMENTS.map((a) => {
      const evaluation = evaluations[a.code];
      return {
        ...a,
        unlockedAt: byCode.get(a.code)?.unlockedAt ?? null,
        progress: evaluation?.progress ?? null,
      };
    });
    return {
      items,
      unlockedCount: rows.length,
      totalCount: ACHIEVEMENTS.length,
    };
  },
});

export const listUnseen = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }
    const rows = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_seen", (q) =>
        q.eq("authUserId", user._id).eq("seenAt", undefined)
      )
      .take(ACHIEVEMENTS.length + 10);
    const byCode = new Map(ACHIEVEMENTS.map((a) => [a.code, a]));
    return rows
      .map((r) => {
        const def = byCode.get(r.code as AchievementCode);
        if (!def) {
          return null;
        }
        return { ...def, unlockedAt: r.unlockedAt };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.unlockedAt - b.unlockedAt);
  },
});

export const markSeen = mutation({
  args: { codes: v.array(v.string()) },
  handler: async (ctx, { codes }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (codes.length > ACHIEVEMENTS.length) {
      throw new Error("Too many codes");
    }
    const now = Date.now();
    const codeSet = new Set(codes);
    const rows = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .take(ACHIEVEMENTS.length + 10);
    for (const row of rows) {
      if (codeSet.has(row.code) && row.seenAt === undefined) {
        await ctx.db.patch(row._id, { seenAt: now });
      }
    }
    return null;
  },
});

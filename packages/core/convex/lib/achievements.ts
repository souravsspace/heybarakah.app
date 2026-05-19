import {
  ACHIEVEMENTS,
  type AchievementCode,
  evaluateAchievements,
  evaluateAllProgress,
} from "@barakah/core/achievements";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { authComponent } from "./auth";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOG_LOOKBACK_DAYS = 365;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function utcToday(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export const runEvaluate = internalMutation({
  args: { authUserId: v.string(), today: v.optional(v.string()) },
  handler: async (ctx, { authUserId, today }) => {
    const dateKey = today && DATE_KEY_PATTERN.test(today) ? today : utcToday();
    const startDate = addDays(dateKey, -LOG_LOOKBACK_DAYS);

    const [prayerLogs, dhikrRows, profile, existing] = await Promise.all([
      ctx.db
        .query("prayerLogs")
        .withIndex("by_user_date_prayer", (q) =>
          q
            .eq("authUserId", authUserId)
            .gte("date", startDate)
            .lte("date", dateKey)
        )
        .collect(),
      ctx.db
        .query("dhikrDaily")
        .withIndex("by_user_date", (q) => q.eq("authUserId", authUserId))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
        .unique(),
      ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
        .collect(),
    ]);

    const dhikrTotal = dhikrRows.reduce((sum, r) => sum + r.count, 0);
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
    const dateKey = utcToday();
    const startDate = addDays(dateKey, -LOG_LOOKBACK_DAYS);
    const [rows, prayerLogs, dhikrRows, profile] = await Promise.all([
      ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("authUserId", user._id))
        .collect(),
      ctx.db
        .query("prayerLogs")
        .withIndex("by_user_date_prayer", (q) =>
          q
            .eq("authUserId", user._id)
            .gte("date", startDate)
            .lte("date", dateKey)
        )
        .collect(),
      ctx.db
        .query("dhikrDaily")
        .withIndex("by_user_date", (q) => q.eq("authUserId", user._id))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
        .unique(),
    ]);
    const byCode = new Map(rows.map((r) => [r.code, r]));
    const dhikrTotal = dhikrRows.reduce((sum, r) => sum + r.count, 0);
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
      },
      alreadyUnlocked
    );
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
      .collect();
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
    const now = Date.now();
    const codeSet = new Set(codes);
    const rows = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("authUserId", user._id))
      .collect();
    for (const row of rows) {
      if (codeSet.has(row.code) && row.seenAt === undefined) {
        await ctx.db.patch(row._id, { seenAt: now });
      }
    }
    return null;
  },
});

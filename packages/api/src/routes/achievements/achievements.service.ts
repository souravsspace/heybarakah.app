import {
  ACHIEVEMENTS,
  type AchievementCode,
  type AchievementEvaluation,
  evaluateAchievements,
  evaluateAllProgress,
} from "@barakah/core/achievements";
import { and, desc, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db";
import {
  dhikrAggregate,
  dhikrDaily,
  prayerLogs,
  prayerTimeCaches,
  userAchievementCounters,
  userAchievements,
  users,
} from "@/db/schema";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TIMEZONE = "UTC";
const LIST_PRAYER_LOG_LIMIT = 1000;
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

async function dhikrTotalForUser(
  db: Database,
  authUserId: string
): Promise<number> {
  const [aggregate] = await db
    .select({ total: dhikrAggregate.total })
    .from(dhikrAggregate)
    .where(eq(dhikrAggregate.authUserId, authUserId))
    .limit(1);
  if (aggregate) {
    return aggregate.total;
  }
  const rows = await db
    .select({ count: dhikrDaily.count })
    .from(dhikrDaily)
    .where(eq(dhikrDaily.authUserId, authUserId))
    .limit(EVALUATE_DHIKR_DAILY_LIMIT);
  return rows.reduce((sum, row) => sum + row.count, 0);
}

/**
 * Ports convex/lib/achievements.ts `runEvaluate` (internalMutation). Evaluates
 * the user's achievements from their prayer logs + dhikr total and inserts any
 * newly unlocked rows. Called inside `dhikr.increment` + `prayerLogs.logPrayer`.
 * Returns the codes inserted this run (empty if none / profile missing).
 */
export async function runEvaluate(
  db: Database,
  { authUserId, today }: { authUserId: string; today?: string }
): Promise<AchievementCode[]> {
  const [tzRow] = await db
    .select({ timezone: prayerTimeCaches.timezone })
    .from(prayerTimeCaches)
    .where(eq(prayerTimeCaches.userId, authUserId))
    .orderBy(desc(prayerTimeCaches.updatedAt))
    .limit(1);
  const timezone = tzRow?.timezone ?? DEFAULT_TIMEZONE;
  const dateKey =
    today && DATE_KEY_PATTERN.test(today) ? today : localToday(timezone);

  const [logs, dhikrTotal, profileRows, existing] = await Promise.all([
    db
      .select()
      .from(prayerLogs)
      .where(eq(prayerLogs.authUserId, authUserId))
      .orderBy(desc(prayerLogs.updatedAt))
      .limit(EVALUATE_PRAYER_LOG_LIMIT),
    dhikrTotalForUser(db, authUserId),
    db.select().from(users).where(eq(users.authUserId, authUserId)).limit(1),
    db
      .select({ code: userAchievements.code })
      .from(userAchievements)
      .where(eq(userAchievements.authUserId, authUserId))
      .limit(ACHIEVEMENTS.length + 10),
  ]);

  // Skip if the profile is gone — a delete-account purge can race with an
  // evaluate and would otherwise re-insert rows for a deleted user.
  const profile = profileRows[0];
  if (!profile) {
    return [];
  }

  const alreadyUnlocked = new Set<AchievementCode>(
    existing.map((row) => row.code as AchievementCode)
  );

  const newly = evaluateAchievements(
    {
      onboardingComplete: Boolean(profile.completedAt),
      prayerLogs: logs.map((l) => ({
        date: l.date,
        prayer: l.prayer,
        status: l.status,
        prayedAt: l.prayedAt ?? undefined,
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
    const [dup] = await db
      .select({ id: userAchievements.id })
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.authUserId, authUserId),
          eq(userAchievements.code, code)
        )
      )
      .limit(1);
    if (dup) {
      continue;
    }
    await db
      .insert(userAchievements)
      .values({ authUserId, code, unlockedAt: now });
    inserted.push(code);
  }
  return inserted;
}

async function latestTimezone(
  db: Database,
  authUserId: string
): Promise<string> {
  const [row] = await db
    .select({ timezone: prayerTimeCaches.timezone })
    .from(prayerTimeCaches)
    .where(eq(prayerTimeCaches.userId, authUserId))
    .orderBy(desc(prayerTimeCaches.updatedAt))
    .limit(1);
  return row?.timezone ?? DEFAULT_TIMEZONE;
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

type AchievementListItem = (typeof ACHIEVEMENTS)[number] & {
  unlockedAt: number | null;
  progress: AchievementEvaluation["progress"] | null;
};

export interface AchievementList {
  items: AchievementListItem[];
  totalCount: number;
  unlockedCount: number;
}

/** Ports `listForMe`: every achievement with its unlock state + live progress. */
export async function listForMe(
  db: Database,
  authUserId: string | null
): Promise<AchievementList> {
  if (!authUserId) {
    return {
      items: ACHIEVEMENTS.map((a) => ({
        ...a,
        unlockedAt: null,
        progress: null,
      })),
      unlockedCount: 0,
      totalCount: ACHIEVEMENTS.length,
    };
  }

  const timezone = await latestTimezone(db, authUserId);
  const dateKey = localToday(timezone);
  const [rows, logs, counterRows, dhikrTotal, profileRows] = await Promise.all([
    db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.authUserId, authUserId))
      .limit(ACHIEVEMENTS.length + 10),
    db
      .select()
      .from(prayerLogs)
      .where(eq(prayerLogs.authUserId, authUserId))
      .orderBy(desc(prayerLogs.updatedAt))
      .limit(LIST_PRAYER_LOG_LIMIT),
    db
      .select()
      .from(userAchievementCounters)
      .where(eq(userAchievementCounters.authUserId, authUserId))
      .limit(1),
    dhikrTotalForUser(db, authUserId),
    db.select().from(users).where(eq(users.authUserId, authUserId)).limit(1),
  ]);

  const profile = profileRows[0];
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const alreadyUnlocked = new Set<AchievementCode>(
    rows.map((r) => r.code as AchievementCode)
  );

  const evaluations = evaluateAllProgress(
    {
      onboardingComplete: Boolean(profile?.completedAt),
      prayerLogs: logs.map((l) => ({
        date: l.date,
        prayer: l.prayer,
        status: l.status,
        prayedAt: l.prayedAt ?? undefined,
        updatedAt: l.updatedAt,
      })),
      dhikrTotal,
      today: dateKey,
      timezone,
    },
    alreadyUnlocked
  );

  // Counter-backed achievements are lazy-built from prayer-log writes; overlay
  // them when a counter row exists (matches Convex listForMe behavior).
  const counters = counterRows[0];
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

  const items = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: byCode.get(a.code)?.unlockedAt ?? null,
    progress: evaluations[a.code]?.progress ?? null,
  }));

  return {
    items,
    unlockedCount: rows.length,
    totalCount: ACHIEVEMENTS.length,
  };
}

/** Ports `listUnseen`: unlocked-but-not-yet-seen achievements, oldest first. */
export async function listUnseen(db: Database, authUserId: string) {
  const rows = await db
    .select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.authUserId, authUserId),
        isNull(userAchievements.seenAt)
      )
    )
    .limit(ACHIEVEMENTS.length + 10);
  const byCode = new Map(ACHIEVEMENTS.map((a) => [a.code, a]));
  return rows
    .map((r) => {
      const def = byCode.get(r.code as AchievementCode);
      return def ? { ...def, unlockedAt: r.unlockedAt } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.unlockedAt - b.unlockedAt);
}

/** Ports `markSeen`: stamp seenAt on the given unlocked achievement codes. */
export async function markSeen(
  db: Database,
  authUserId: string,
  codes: string[]
): Promise<void> {
  const now = Date.now();
  const codeSet = new Set(codes);
  const rows = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.authUserId, authUserId))
    .limit(ACHIEVEMENTS.length + 10);
  for (const row of rows) {
    if (codeSet.has(row.code) && row.seenAt === null) {
      await db
        .update(userAchievements)
        .set({ seenAt: now })
        .where(eq(userAchievements.id, row.id));
    }
  }
}

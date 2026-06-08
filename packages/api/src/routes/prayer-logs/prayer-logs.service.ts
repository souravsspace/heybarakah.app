import type { AchievementCode } from "@barakah/core/achievements";
import { and, eq, gte, lte } from "drizzle-orm";

import type { Database } from "@/db";
import { prayerLogs, userAchievementCounters } from "@/db/schema";
import { runEvaluate } from "@/routes/achievements/achievements.service";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export const STATUSES = ["early", "on_time", "late", "qada", "missed"] as const;
export type Prayer = (typeof PRAYERS)[number];
export type PrayerStatus = (typeof STATUSES)[number];

// Matches MAX_STREAK_LOOKBACK_DAYS in core src/achievements/evaluate.ts.
const STREAK_MAX_LOOKBACK = 800;
const STREAK_HISTORY_DAYS = 28;
const ALL_FIVE = 5;
const WEEK_PRAYER_LOG_LIMIT = 100;
const STREAK_COUNTABLE_STATUSES = new Set(["on_time", "late", "qada"]);

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function isValidDateKey(dateKey: string): boolean {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return false;
  }
  const d = new Date(`${dateKey}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateKey;
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

interface CounterLog {
  prayer: Prayer;
  status: PrayerStatus;
}

function prayerCounterDelta(log: CounterLog) {
  return {
    countablePrayerLogs: STREAK_COUNTABLE_STATUSES.has(log.status) ? 1 : 0,
    fajrOnTimePrayerLogs:
      log.prayer === "fajr" && log.status === "on_time" ? 1 : 0,
    onTimePrayerLogs: log.status === "on_time" ? 1 : 0,
    qadaPrayerLogs: log.status === "qada" ? 1 : 0,
  };
}

async function applyPrayerCounterDelta(
  db: Database,
  authUserId: string,
  delta: ReturnType<typeof prayerCounterDelta>
): Promise<void> {
  const now = Date.now();
  const [existing] = await db
    .select()
    .from(userAchievementCounters)
    .where(eq(userAchievementCounters.authUserId, authUserId))
    .limit(1);
  if (existing) {
    await db
      .update(userAchievementCounters)
      .set({
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
        qadaPrayerLogs: Math.max(
          0,
          existing.qadaPrayerLogs + delta.qadaPrayerLogs
        ),
        updatedAt: now,
      })
      .where(eq(userAchievementCounters.authUserId, authUserId));
    return;
  }
  await db.insert(userAchievementCounters).values({
    authUserId,
    countablePrayerLogs: Math.max(0, delta.countablePrayerLogs),
    fajrOnTimePrayerLogs: Math.max(0, delta.fajrOnTimePrayerLogs),
    onTimePrayerLogs: Math.max(0, delta.onTimePrayerLogs),
    qadaPrayerLogs: Math.max(0, delta.qadaPrayerLogs),
    updatedAt: now,
  });
}

async function findLog(
  db: Database,
  authUserId: string,
  date: string,
  prayer: Prayer
) {
  const [row] = await db
    .select()
    .from(prayerLogs)
    .where(
      and(
        eq(prayerLogs.authUserId, authUserId),
        eq(prayerLogs.date, date),
        eq(prayerLogs.prayer, prayer)
      )
    )
    .limit(1);
  return row;
}

export async function getMyWeek(
  db: Database,
  authUserId: string,
  startDate: string
) {
  const endDate = addDays(startDate, 6);
  return await db
    .select()
    .from(prayerLogs)
    .where(
      and(
        eq(prayerLogs.authUserId, authUserId),
        gte(prayerLogs.date, startDate),
        lte(prayerLogs.date, endDate)
      )
    )
    .limit(WEEK_PRAYER_LOG_LIMIT);
}

export interface StreakResult {
  asOf: string;
  best: number;
  days: number;
  history: number[];
  todayDone: number;
}

export async function getStreak(
  db: Database,
  authUserId: string,
  today: string
): Promise<StreakResult> {
  const startDate = addDays(today, -STREAK_MAX_LOOKBACK);
  const logs = await db
    .select({
      date: prayerLogs.date,
      prayer: prayerLogs.prayer,
      status: prayerLogs.status,
    })
    .from(prayerLogs)
    .where(
      and(
        eq(prayerLogs.authUserId, authUserId),
        gte(prayerLogs.date, startDate),
        lte(prayerLogs.date, today)
      )
    )
    .limit(STREAK_MAX_LOOKBACK * 5 + 10);

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

  const history: number[] = [];
  for (let i = STREAK_HISTORY_DAYS - 1; i >= 0; i--) {
    history.push(isComplete(addDays(today, -i)) ? 1 : 0);
  }

  const todayDone = Math.min(ALL_FIVE, byDate.get(today)?.size ?? 0);
  return { days, best, history, todayDone, asOf: today };
}

export interface LogPrayerInput {
  date: string;
  prayedAt?: number;
  prayer: Prayer;
  status: PrayerStatus;
}

export interface LogPrayerResult {
  streak: StreakResult;
  unlocked: AchievementCode[];
}

export async function logPrayer(
  db: Database,
  authUserId: string,
  args: LogPrayerInput
): Promise<LogPrayerResult> {
  const now = Date.now();
  const existing = await findLog(db, authUserId, args.date, args.prayer);
  if (existing) {
    const previous = prayerCounterDelta(existing);
    const next = prayerCounterDelta(args);
    await db
      .update(prayerLogs)
      .set({ status: args.status, prayedAt: args.prayedAt, updatedAt: now })
      .where(eq(prayerLogs.id, existing.id));
    await applyPrayerCounterDelta(db, authUserId, {
      countablePrayerLogs:
        next.countablePrayerLogs - previous.countablePrayerLogs,
      fajrOnTimePrayerLogs:
        next.fajrOnTimePrayerLogs - previous.fajrOnTimePrayerLogs,
      onTimePrayerLogs: next.onTimePrayerLogs - previous.onTimePrayerLogs,
      qadaPrayerLogs: next.qadaPrayerLogs - previous.qadaPrayerLogs,
    });
  } else {
    await db.insert(prayerLogs).values({
      authUserId,
      date: args.date,
      prayer: args.prayer,
      status: args.status,
      prayedAt: args.prayedAt,
      updatedAt: now,
    });
    await applyPrayerCounterDelta(db, authUserId, prayerCounterDelta(args));
  }

  // §8: return derived state so the client avoids extra round-trips.
  const unlocked = await runEvaluate(db, {
    authUserId,
    today: args.date,
  });
  const streak = await getStreak(db, authUserId, args.date);
  return { streak, unlocked };
}

export async function clearPrayer(
  db: Database,
  authUserId: string,
  date: string,
  prayer: Prayer
): Promise<void> {
  const existing = await findLog(db, authUserId, date, prayer);
  if (!existing) {
    return;
  }
  await db.delete(prayerLogs).where(eq(prayerLogs.id, existing.id));
  const previous = prayerCounterDelta(existing);
  await applyPrayerCounterDelta(db, authUserId, {
    countablePrayerLogs: -previous.countablePrayerLogs,
    fajrOnTimePrayerLogs: -previous.fajrOnTimePrayerLogs,
    onTimePrayerLogs: -previous.onTimePrayerLogs,
    qadaPrayerLogs: -previous.qadaPrayerLogs,
  });
}

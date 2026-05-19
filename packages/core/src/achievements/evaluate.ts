import { ACHIEVEMENT_CODES } from "./definitions";
import type { AchievementCode, EvaluationContext } from "./types";

const ALL_FIVE = 5;
const COUNTABLE = new Set(["on_time", "late", "qada"]);

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function buildDateMap(ctx: EvaluationContext) {
  const byDate = new Map<string, Set<string>>();
  for (const log of ctx.prayerLogs) {
    if (!COUNTABLE.has(log.status)) {
      continue;
    }
    const set = byDate.get(log.date) ?? new Set<string>();
    set.add(log.prayer);
    byDate.set(log.date, set);
  }
  return byDate;
}

function currentFullStreak(
  byDate: Map<string, Set<string>>,
  today: string
): number {
  const isComplete = (d: string) => (byDate.get(d)?.size ?? 0) >= ALL_FIVE;
  let days = isComplete(today) ? 1 : 0;
  let cursor = addDays(today, -1);
  for (let i = 0; i < 365; i++) {
    if (!isComplete(cursor)) {
      break;
    }
    days++;
    cursor = addDays(cursor, -1);
  }
  return days;
}

function currentFajrStreak(ctx: EvaluationContext, today: string): number {
  const onTimeFajr = new Set<string>();
  for (const log of ctx.prayerLogs) {
    if (log.prayer === "fajr" && log.status === "on_time") {
      onTimeFajr.add(log.date);
    }
  }
  let days = onTimeFajr.has(today) ? 1 : 0;
  let cursor = addDays(today, -1);
  for (let i = 0; i < 365; i++) {
    if (!onTimeFajr.has(cursor)) {
      break;
    }
    days++;
    cursor = addDays(cursor, -1);
  }
  return days;
}

function lifetimePerfectDays(byDate: Map<string, Set<string>>): number {
  let count = 0;
  for (const set of byDate.values()) {
    if (set.size >= ALL_FIVE) {
      count++;
    }
  }
  return count;
}

function detectComeback(ctx: EvaluationContext): boolean {
  const dates = Array.from(
    new Set(
      ctx.prayerLogs.filter((l) => COUNTABLE.has(l.status)).map((l) => l.date)
    )
  ).sort();
  if (dates.length < 2) {
    return false;
  }
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(`${dates[i - 1]}T00:00:00Z`).getTime();
    const cur = new Date(`${dates[i]}T00:00:00Z`).getTime();
    const gapDays = Math.round((cur - prev) / 86_400_000);
    if (gapDays >= 7) {
      return true;
    }
  }
  return false;
}

const PREDICATES: Record<AchievementCode, (ctx: EvaluationContext) => boolean> =
  {
    first_steps: (ctx) => ctx.onboardingComplete,
    first_log: (ctx) => ctx.prayerLogs.some((l) => COUNTABLE.has(l.status)),
    first_on_time: (ctx) => ctx.prayerLogs.some((l) => l.status === "on_time"),
    streak_3: (ctx) => currentFullStreak(buildDateMap(ctx), ctx.today) >= 3,
    streak_7: (ctx) => currentFullStreak(buildDateMap(ctx), ctx.today) >= 7,
    streak_30: (ctx) => currentFullStreak(buildDateMap(ctx), ctx.today) >= 30,
    streak_100: (ctx) => currentFullStreak(buildDateMap(ctx), ctx.today) >= 100,
    perfect_day_1: (ctx) => lifetimePerfectDays(buildDateMap(ctx)) >= 1,
    perfect_day_7: (ctx) => lifetimePerfectDays(buildDateMap(ctx)) >= 7,
    perfect_day_30: (ctx) => lifetimePerfectDays(buildDateMap(ctx)) >= 30,
    fajr_streak_7: (ctx) => currentFajrStreak(ctx, ctx.today) >= 7,
    fajr_streak_30: (ctx) => currentFajrStreak(ctx, ctx.today) >= 30,
    dhikr_100: (ctx) => ctx.dhikrTotal >= 100,
    dhikr_1000: (ctx) => ctx.dhikrTotal >= 1000,
    dhikr_10000: (ctx) => ctx.dhikrTotal >= 10_000,
    qada_first: (ctx) => ctx.prayerLogs.some((l) => l.status === "qada"),
    comeback: (ctx) => detectComeback(ctx),
  };

export function evaluateAchievements(
  ctx: EvaluationContext,
  alreadyUnlocked: ReadonlySet<AchievementCode>
): AchievementCode[] {
  const newlyUnlocked: AchievementCode[] = [];
  for (const code of ACHIEVEMENT_CODES) {
    if (alreadyUnlocked.has(code)) {
      continue;
    }
    if (PREDICATES[code](ctx)) {
      newlyUnlocked.push(code);
    }
  }
  return newlyUnlocked;
}

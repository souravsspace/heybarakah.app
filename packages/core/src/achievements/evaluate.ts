import { enumerateDates, isInSacredMonth, RAMADAN_RANGES } from "./calendar";
import { ACHIEVEMENT_CODES, ACHIEVEMENTS } from "./definitions";
import type {
  AchievementCode,
  AchievementEvaluation,
  AchievementTier,
  EvaluationContext,
} from "./types";

const ALL_FIVE = 5;
const COUNTABLE = new Set(["on_time", "late", "qada"]);
const REFLECTION_BUCKET = new Set<AchievementCode>([
  "all_bronze",
  "all_silver",
  "all_gold",
]);
const FINAL_REFLECTION: AchievementCode = "complete";

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

function buildOnTimeDateMap(ctx: EvaluationContext) {
  const byDate = new Map<string, Set<string>>();
  for (const log of ctx.prayerLogs) {
    if (log.status !== "on_time") {
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
  for (let i = 0; i < 800; i++) {
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

function currentIshaStreak(ctx: EvaluationContext, today: string): number {
  const onTimeIsha = new Set<string>();
  for (const log of ctx.prayerLogs) {
    if (log.prayer === "isha" && log.status === "on_time") {
      onTimeIsha.add(log.date);
    }
  }
  let days = onTimeIsha.has(today) ? 1 : 0;
  let cursor = addDays(today, -1);
  for (let i = 0; i < 365; i++) {
    if (!onTimeIsha.has(cursor)) {
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

function lifetimeOnTimeCount(
  ctx: EvaluationContext,
  prayer: "fajr" | "isha"
): number {
  let n = 0;
  for (const log of ctx.prayerLogs) {
    if (log.prayer === prayer && log.status === "on_time") {
      n++;
    }
  }
  return n;
}

function lifetimeLateIsha(ctx: EvaluationContext): number {
  let n = 0;
  for (const log of ctx.prayerLogs) {
    if (
      log.prayer === "isha" &&
      COUNTABLE.has(log.status) &&
      log.prayedAt !== undefined
    ) {
      const hour = localHour(log.prayedAt, ctx.timezone);
      if (hour >= 22 || hour < 3) {
        n++;
      }
    }
  }
  return n;
}

function localHour(timestamp: number, timezone?: string): number {
  if (!timezone) {
    return new Date(timestamp).getUTCHours();
  }
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    }).format(new Date(timestamp));
    return Number.parseInt(formatted, 10) % 24;
  } catch {
    return new Date(timestamp).getUTCHours();
  }
}

function fajrOnTimeInLastDays(ctx: EvaluationContext, days: number): number {
  const cutoff = addDays(ctx.today, -(days - 1));
  let n = 0;
  const seen = new Set<string>();
  for (const log of ctx.prayerLogs) {
    if (
      log.prayer === "fajr" &&
      log.status === "on_time" &&
      log.date >= cutoff &&
      log.date <= ctx.today &&
      !seen.has(log.date)
    ) {
      seen.add(log.date);
      n++;
    }
  }
  return n;
}

function countQada(ctx: EvaluationContext): number {
  let n = 0;
  for (const log of ctx.prayerLogs) {
    if (log.status === "qada") {
      n++;
    }
  }
  return n;
}

function countComebacks(ctx: EvaluationContext): number {
  const dates = Array.from(
    new Set(
      ctx.prayerLogs.filter((l) => COUNTABLE.has(l.status)).map((l) => l.date)
    )
  ).sort();
  if (dates.length < 2) {
    return 0;
  }
  let n = 0;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(`${dates[i - 1]}T00:00:00Z`).getTime();
    const cur = new Date(`${dates[i]}T00:00:00Z`).getTime();
    const gapDays = Math.round((cur - prev) / 86_400_000);
    if (gapDays >= 8) {
      n++;
    }
  }
  return n;
}

function distinctFridaysOnTime(ctx: EvaluationContext): number {
  const seen = new Set<string>();
  for (const log of ctx.prayerLogs) {
    if (log.prayer !== "dhuhr" || log.status !== "on_time") {
      continue;
    }
    const [y, m, d] = log.date.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (dow === 5) {
      seen.add(log.date);
    }
  }
  return seen.size;
}

function sacredMonthCompleteDay(
  byDate: Map<string, Set<string>>,
  ctx: EvaluationContext
): boolean {
  for (const [date, set] of byDate.entries()) {
    if (set.size >= ALL_FIVE && isInSacredMonth(date) && date <= ctx.today) {
      return true;
    }
  }
  return false;
}

function ramadanCompleteStrict(
  byDate: Map<string, Set<string>>,
  ctx: EvaluationContext
): boolean {
  for (const range of RAMADAN_RANGES) {
    if (range.end > ctx.today) {
      continue;
    }
    let complete = true;
    for (const date of enumerateDates(range)) {
      if ((byDate.get(date)?.size ?? 0) < ALL_FIVE) {
        complete = false;
        break;
      }
    }
    if (complete) {
      return true;
    }
  }
  return false;
}

type BasePredicate = (ctx: EvaluationContext) => AchievementEvaluation;

function bool(unlocked: boolean): AchievementEvaluation {
  return { unlocked };
}

function progress(
  current: number,
  target: number,
  unit: string
): AchievementEvaluation {
  const clamped = Math.min(current, target);
  return {
    unlocked: current >= target,
    progress: { current: clamped, target, unit },
  };
}

const BASE_PREDICATES: Record<
  Exclude<
    AchievementCode,
    "all_bronze" | "all_silver" | "all_gold" | "complete"
  >,
  BasePredicate
> = {
  first_steps: (ctx) => bool(ctx.onboardingComplete),
  first_log: (ctx) => bool(ctx.prayerLogs.some((l) => COUNTABLE.has(l.status))),
  first_on_time: (ctx) =>
    bool(ctx.prayerLogs.some((l) => l.status === "on_time")),
  first_dhikr: (ctx) => bool(ctx.dhikrTotal >= 1),
  perfect_day_1: (ctx) =>
    progress(lifetimePerfectDays(buildOnTimeDateMap(ctx)), 1, "days"),
  perfect_day_7: (ctx) =>
    progress(lifetimePerfectDays(buildOnTimeDateMap(ctx)), 7, "days"),
  perfect_day_30: (ctx) =>
    progress(lifetimePerfectDays(buildOnTimeDateMap(ctx)), 30, "days"),
  streak_3: (ctx) =>
    progress(currentFullStreak(buildDateMap(ctx), ctx.today), 3, "day streak"),
  streak_7: (ctx) =>
    progress(currentFullStreak(buildDateMap(ctx), ctx.today), 7, "day streak"),
  streak_30: (ctx) =>
    progress(currentFullStreak(buildDateMap(ctx), ctx.today), 30, "day streak"),
  streak_100: (ctx) =>
    progress(
      currentFullStreak(buildDateMap(ctx), ctx.today),
      100,
      "day streak"
    ),
  streak_365: (ctx) =>
    progress(
      currentFullStreak(buildDateMap(ctx), ctx.today),
      365,
      "day streak"
    ),
  fajr_streak_7: (ctx) =>
    progress(currentFajrStreak(ctx, ctx.today), 7, "Fajr days"),
  fajr_streak_30: (ctx) =>
    progress(currentFajrStreak(ctx, ctx.today), 30, "Fajr days"),
  pre_dawn_watcher: (ctx) =>
    progress(fajrOnTimeInLastDays(ctx, 21), 14, "Fajr days"),
  fajr_100: (ctx) => progress(lifetimeOnTimeCount(ctx, "fajr"), 100, "Fajr"),
  isha_streak_7: (ctx) =>
    progress(currentIshaStreak(ctx, ctx.today), 7, "Isha days"),
  late_devotion: (ctx) => progress(lifetimeLateIsha(ctx), 30, "Isha nights"),
  night_complete_30: (ctx) =>
    progress(currentIshaStreak(ctx, ctx.today), 30, "Isha days"),
  dhikr_100: (ctx) => progress(ctx.dhikrTotal, 100, "dhikr"),
  dhikr_1000: (ctx) => progress(ctx.dhikrTotal, 1000, "dhikr"),
  dhikr_10000: (ctx) => progress(ctx.dhikrTotal, 10_000, "dhikr"),
  dhikr_100k: (ctx) => progress(ctx.dhikrTotal, 100_000, "dhikr"),
  qada_first: (ctx) => bool(ctx.prayerLogs.some((l) => l.status === "qada")),
  qada_seven: (ctx) => progress(countQada(ctx), 7, "qadā"),
  comeback: (ctx) => bool(countComebacks(ctx) >= 1),
  gentle_return: (ctx) => progress(countComebacks(ctx), 3, "returns"),
  jumuah_4: (ctx) => progress(distinctFridaysOnTime(ctx), 4, "Fridays"),
  jumuah_12: (ctx) => progress(distinctFridaysOnTime(ctx), 12, "Fridays"),
  sacred_month_day: (ctx) =>
    bool(sacredMonthCompleteDay(buildDateMap(ctx), ctx)),
  ramadan_complete: (ctx) =>
    bool(ramadanCompleteStrict(buildDateMap(ctx), ctx)),
};

function tierFor(code: AchievementCode): AchievementTier {
  const def = ACHIEVEMENTS.find((a) => a.code === code);
  if (!def) {
    return "bronze";
  }
  return def.tier;
}

function codesOfTier(tier: AchievementTier): AchievementCode[] {
  return ACHIEVEMENTS.filter(
    (a) =>
      a.tier === tier &&
      a.code !== "all_bronze" &&
      a.code !== "all_silver" &&
      a.code !== "all_gold" &&
      a.code !== "complete"
  ).map((a) => a.code);
}

function reflectionEval(
  code: "all_bronze" | "all_silver" | "all_gold",
  unlocked: ReadonlySet<AchievementCode>
): AchievementEvaluation {
  const tier: AchievementTier =
    code === "all_bronze"
      ? "bronze"
      : code === "all_silver"
        ? "silver"
        : "gold";
  const targetCodes = codesOfTier(tier);
  const current = targetCodes.filter((c) => unlocked.has(c)).length;
  return progress(current, targetCodes.length, `${tier} unlocked`);
}

function completeEval(
  unlocked: ReadonlySet<AchievementCode>
): AchievementEvaluation {
  const targets = ACHIEVEMENT_CODES.filter((c) => c !== FINAL_REFLECTION);
  const current = targets.filter((c) => unlocked.has(c)).length;
  return progress(current, targets.length, "unlocked");
}

export function evaluateAllProgress(
  ctx: EvaluationContext,
  alreadyUnlocked: ReadonlySet<AchievementCode>
): Record<AchievementCode, AchievementEvaluation> {
  const out: Partial<Record<AchievementCode, AchievementEvaluation>> = {};
  const liveUnlocked = new Set<AchievementCode>(alreadyUnlocked);

  for (const code of ACHIEVEMENT_CODES) {
    if (REFLECTION_BUCKET.has(code) || code === FINAL_REFLECTION) {
      continue;
    }
    const result = BASE_PREDICATES[code as keyof typeof BASE_PREDICATES](ctx);
    out[code] = result;
    if (result.unlocked) {
      liveUnlocked.add(code);
    }
  }

  for (const code of REFLECTION_BUCKET) {
    const r = reflectionEval(
      code as "all_bronze" | "all_silver" | "all_gold",
      liveUnlocked
    );
    out[code] = r;
    if (r.unlocked) {
      liveUnlocked.add(code);
    }
  }

  out[FINAL_REFLECTION] = completeEval(liveUnlocked);

  return out as Record<AchievementCode, AchievementEvaluation>;
}

export function evaluateAchievements(
  ctx: EvaluationContext,
  alreadyUnlocked: ReadonlySet<AchievementCode>
): AchievementCode[] {
  const all = evaluateAllProgress(ctx, alreadyUnlocked);
  const newly: AchievementCode[] = [];
  for (const code of ACHIEVEMENT_CODES) {
    if (alreadyUnlocked.has(code)) {
      continue;
    }
    if (all[code].unlocked) {
      newly.push(code);
    }
  }
  return newly;
}

export { tierFor };

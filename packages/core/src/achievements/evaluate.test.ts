import { describe, expect, test } from "bun:test";
import { evaluateAllProgress } from "./evaluate";
import type { EvaluationContext, PrayerLogEntry } from "./types";

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

function log(
  date: string,
  prayer: PrayerLogEntry["prayer"],
  status: PrayerLogEntry["status"],
  prayedAt?: number
): PrayerLogEntry {
  return {
    date,
    prayer,
    status,
    prayedAt,
    updatedAt: Date.parse(`${date}T00:00:00Z`),
  };
}

function fullDay(
  date: string,
  status: PrayerLogEntry["status"]
): PrayerLogEntry[] {
  return PRAYERS.map((prayer) => log(date, prayer, status));
}

function context(
  prayerLogs: PrayerLogEntry[],
  overrides: Partial<EvaluationContext> & { timezone?: string } = {}
): EvaluationContext {
  return {
    dhikrTotal: 0,
    onboardingComplete: false,
    prayerLogs,
    today: "2026-04-01",
    ...overrides,
  };
}

describe("evaluateAllProgress", () => {
  test("requires on-time salah for perfect days but keeps countable streaks", () => {
    const evaluations = evaluateAllProgress(
      context([
        ...fullDay("2026-03-30", "late"),
        ...fullDay("2026-03-31", "qada"),
        ...fullDay("2026-04-01", "late"),
      ]),
      new Set()
    );

    expect(evaluations.perfect_day_1.progress?.current).toBe(0);
    expect(evaluations.perfect_day_1.unlocked).toBe(false);
    expect(evaluations.streak_3.progress?.current).toBe(3);
    expect(evaluations.streak_3.unlocked).toBe(true);
  });

  test("uses timezone-local hours for late Isha devotion", () => {
    const logs = Array.from({ length: 30 }, (_, index) => {
      const day = `${index + 1}`.padStart(2, "0");
      return log(
        `2026-01-${day}`,
        "isha",
        "on_time",
        Date.UTC(2026, 0, index + 1, 16, 30)
      );
    });

    const utcEvaluations = evaluateAllProgress(context(logs), new Set());
    const localEvaluations = evaluateAllProgress(
      context(logs, { timezone: "Asia/Dhaka" }),
      new Set()
    );

    expect(utcEvaluations.late_devotion.unlocked).toBe(false);
    expect(localEvaluations.late_devotion.unlocked).toBe(true);
  });

  test("unlocks Ramadan completion for any completed past Ramadan", () => {
    const ramadanLogs = Array.from({ length: 29 }, (_, index) => {
      const day = `${index + 1}`.padStart(2, "0");
      return fullDay(`2025-03-${day}`, "late");
    }).flat();

    const evaluations = evaluateAllProgress(
      context(ramadanLogs, { today: "2026-04-01" }),
      new Set()
    );

    expect(evaluations.ramadan_complete.unlocked).toBe(true);
  });

  test("requires seven missed calendar days before a comeback unlocks", () => {
    const sixMissedDays = evaluateAllProgress(
      context([
        log("2026-01-01", "fajr", "on_time"),
        log("2026-01-08", "fajr", "on_time"),
      ]),
      new Set()
    );
    const sevenMissedDays = evaluateAllProgress(
      context([
        log("2026-01-01", "fajr", "on_time"),
        log("2026-01-09", "fajr", "on_time"),
      ]),
      new Set()
    );

    expect(sixMissedDays.comeback.unlocked).toBe(false);
    expect(sevenMissedDays.comeback.unlocked).toBe(true);
  });
});

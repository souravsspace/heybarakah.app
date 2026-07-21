import { describe, expect, test } from "bun:test";

import type {
  Achievement,
  AchievementEvaluation,
  EvaluationContext,
  PrayerLogEntry,
} from "./types";

// Types carry no runtime; these assertions pin the shape so a breaking rename
// fails compilation, and give the file executable coverage.
describe("achievements types", () => {
  test("PrayerLogEntry accepts a well-formed entry", () => {
    const entry: PrayerLogEntry = {
      date: "2026-03-01",
      prayer: "fajr",
      status: "on_time",
      updatedAt: 1,
    };
    expect(entry.prayer).toBe("fajr");
  });

  test("EvaluationContext composes logs and totals", () => {
    const ctx: EvaluationContext = {
      dhikrTotal: 0,
      onboardingComplete: true,
      prayerLogs: [],
      today: "2026-03-01",
    };
    expect(ctx.prayerLogs).toHaveLength(0);
  });

  test("AchievementEvaluation carries progress", () => {
    const evaln: AchievementEvaluation = {
      unlocked: false,
      progress: { current: 1, target: 5, unit: "days" },
    };
    expect(evaln.progress?.target).toBe(5);
  });

  test("Achievement quote is optional", () => {
    const a: Achievement = {
      code: "first_log",
      title: "t",
      description: "d",
      category: "beginnings",
      tier: "bronze",
      icon: "checkmark-circle-outline",
    };
    expect(a.quote).toBeUndefined();
  });
});

import { describe, expect, test } from "bun:test";
import {
  calculateAdhanJsPrayerDays,
  getAdhanJsCalculationParameters,
  isAdhanJsSupportedMethod,
} from "./adhan-js";

describe("adhan js fallback", () => {
  test("supports known AlAdhan method ids", () => {
    for (const method of [1, 2, 3, 4, 5, 9, 10, 11, 13, 15]) {
      expect(isAdhanJsSupportedMethod(method)).toBe(true);
      expect(getAdhanJsCalculationParameters(method)).not.toBeNull();
    }
  });

  test("returns unsupported for methods without safe mapping", () => {
    for (const unsupportedMethod of [8, 12, 14]) {
      expect(isAdhanJsSupportedMethod(unsupportedMethod)).toBe(false);
      expect(getAdhanJsCalculationParameters(unsupportedMethod)).toBeNull();
    }
  });

  test("maps school=1 to hanafi and returns 7 daily records", () => {
    const days = calculateAdhanJsPrayerDays({
      latitude: 23.8103,
      longitude: 90.4125,
      timezone: "Asia/Dhaka",
      method: 1,
      school: 1,
      startDate: "2026-05-11",
      days: 7,
    });

    expect(days).not.toBeNull();
    expect(days).toHaveLength(7);
    const dates = new Set(days?.map((day) => day.date));
    expect(dates.size).toBe(7);
  });

  test("returns null for unsupported method ids", () => {
    const days = calculateAdhanJsPrayerDays({
      latitude: 23.8103,
      longitude: 90.4125,
      timezone: "Asia/Dhaka",
      method: 8,
      school: 0,
      startDate: "2026-05-11",
      days: 7,
    });

    expect(days).toBeNull();
  });

  test("populates hijri date for every day in dd-mm-yyyy format", () => {
    const days = calculateAdhanJsPrayerDays({
      latitude: 21.4225,
      longitude: 39.8262,
      timezone: "Asia/Riyadh",
      method: 4,
      school: 0,
      startDate: "2026-05-11",
      days: 7,
    });

    expect(days).not.toBeNull();
    for (const day of days ?? []) {
      expect(day.hijriDate).toMatch(/^\d{2}-\d{2}-\d{3,4}$/);
    }
  });
});

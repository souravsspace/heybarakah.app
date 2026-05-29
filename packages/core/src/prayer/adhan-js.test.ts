import { describe, expect, test } from "bun:test";
import { HighLatitudeRule, PolarCircleResolution } from "adhan";
import {
  calculateAdhanJsPrayerDays,
  getAdhanJsCalculationParameters,
  isAdhanJsSupportedMethod,
} from "./adhan-js";

const HIJRI_DATE_PATTERN = /^\d{2}-\d{2}-\d{3,4}$/;

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

  test("maps AlAdhan modifiers to adhan calculation parameters", () => {
    const params = getAdhanJsCalculationParameters(3, {
      latitudeAdjustmentMethod: 2,
      midnightMode: 1,
      tune: "0,2,3,4,5,6,0,7,0",
    });

    expect(params?.highLatitudeRule).toBe(HighLatitudeRule.SeventhOfTheNight);
    expect(params?.polarCircleResolution).toBe(PolarCircleResolution.AqrabYaum);
    expect(params?.adjustments).toEqual({
      fajr: 2,
      sunrise: 3,
      dhuhr: 4,
      asr: 5,
      maghrib: 6,
      isha: 7,
    });
  });

  test("throws when tune includes fields adhan fallback cannot represent", () => {
    expect(() =>
      getAdhanJsCalculationParameters(3, {
        tune: "1,0,0,0,0,0,0,0,0",
      })
    ).toThrow("imsak");
    expect(() =>
      getAdhanJsCalculationParameters(3, {
        tune: "0,0,0,0,0,0,1,0,0",
      })
    ).toThrow("sunset");
    expect(() =>
      getAdhanJsCalculationParameters(3, {
        tune: "0,0,0,0,0,0,0,0,1",
      })
    ).toThrow("midnight");
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
      expect(day.hijriDate).toMatch(HIJRI_DATE_PATTERN);
    }
  });
});

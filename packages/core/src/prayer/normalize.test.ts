import { describe, expect, test } from "bun:test";
import {
  addDays,
  comparePrayerDays,
  formatDateKey,
  normalizeAlAdhanTimingString,
  slicePrayerDays,
} from "./normalize";

describe("prayer normalization", () => {
  test("strips timezone suffixes from AlAdhan strings", () => {
    expect(normalizeAlAdhanTimingString("04:12 (BST)")).toBe("04:12");
    expect(normalizeAlAdhanTimingString("18:43 (+06)")).toBe("18:43");
    expect(normalizeAlAdhanTimingString("5:07 am")).toBe("05:07");
  });

  test("formats and adds Gregorian date keys", () => {
    expect(formatDateKey(new Date(Date.UTC(2026, 4, 11)))).toBe("2026-05-11");
    expect(addDays("2026-05-11", 2)).toBe("2026-05-13");
  });

  test("slices prayer days by start date and length", () => {
    const days = ["2026-05-10", "2026-05-11", "2026-05-12"].map((date) => ({
      date,
      timings: {
        fajr: "04:00",
        sunrise: "05:20",
        dhuhr: "12:00",
        asr: "15:30",
        maghrib: "18:30",
        isha: "19:45",
      },
      timezone: "Asia/Dhaka",
      method: 1,
      school: 1,
      location: { latitude: 23.8103, longitude: 90.4125 },
      source: "aladhan" as const,
    }));

    expect(
      slicePrayerDays(days, "2026-05-11", 2).map((day) => day.date)
    ).toEqual(["2026-05-11", "2026-05-12"]);
  });

  test("compares prayer-day minute differences", () => {
    const base = {
      date: "2026-05-11",
      timings: {
        fajr: "04:00",
        sunrise: "05:20",
        dhuhr: "12:00",
        asr: "15:30",
        maghrib: "18:30",
        isha: "19:45",
      },
      timezone: "Asia/Dhaka",
      method: 1,
      school: 1,
      location: { latitude: 23.8103, longitude: 90.4125 },
      source: "aladhan" as const,
    };

    const comparison = comparePrayerDays(
      [base],
      [
        {
          ...base,
          timings: { ...base.timings, fajr: "04:03" },
          source: "adhan-js" as const,
        },
      ]
    );
    expect(comparison.maxDifferenceMinutes).toBe(3);
    expect(comparison.perDay[0]?.differences.fajr).toBe(3);
  });
});

import { describe, expect, test } from "bun:test";
import type { Timings } from "@/lib/prayer-shield-windows";
import { prayerWindowEndMinutes } from "@/lib/prayer-window-end";

/**
 * These bounds decide when the "your time is running out" reminder fires. Get
 * isha wrong and the app wakes people at 4am, so the boundary is pinned here.
 */

const TIMINGS: Timings = {
  fajr: "05:00",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:20",
  isha: "19:50",
};

describe("prayerWindowEndMinutes", () => {
  test("each prayer but isha expires when the next is called", () => {
    expect(prayerWindowEndMinutes("fajr", TIMINGS)).toBe(12 * 60 + 30);
    expect(prayerWindowEndMinutes("dhuhr", TIMINGS)).toBe(15 * 60 + 45);
    expect(prayerWindowEndMinutes("asr", TIMINGS)).toBe(18 * 60 + 20);
    expect(prayerWindowEndMinutes("maghrib", TIMINGS)).toBe(19 * 60 + 50);
  });

  test("isha expires at Islamic midnight, not at fajr", () => {
    // maghrib 18:20 (1100) → next fajr 05:00 (300 + 1440 = 1740).
    // Midpoint = 1100 + (1740 - 1100) / 2 = 1420 → 23:40.
    expect(prayerWindowEndMinutes("isha", TIMINGS, "05:00")).toBe(1420);
  });

  test("isha's midnight can land past 24:00 and is reported as such", () => {
    const late: Timings = { ...TIMINGS, maghrib: "20:00" };
    // maghrib 1200 → fajr 04:00 (240 + 1440 = 1680). Midpoint = 1440 = 00:00.
    expect(prayerWindowEndMinutes("isha", late, "04:00")).toBe(1440);
  });

  test("isha falls back to today's fajr when tomorrow's is unknown", () => {
    expect(prayerWindowEndMinutes("isha", TIMINGS)).toBe(
      prayerWindowEndMinutes("isha", TIMINGS, "05:00")
    );
  });

  test("returns null without usable timings", () => {
    expect(prayerWindowEndMinutes("dhuhr", null)).toBeNull();
    expect(prayerWindowEndMinutes("dhuhr", undefined)).toBeNull();
    expect(
      prayerWindowEndMinutes("fajr", { ...TIMINGS, dhuhr: "99:99" })
    ).toBeNull();
    expect(
      prayerWindowEndMinutes("isha", { ...TIMINGS, maghrib: "" })
    ).toBeNull();
  });
});

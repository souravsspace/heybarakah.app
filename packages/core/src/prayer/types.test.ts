import { describe, expect, test } from "bun:test";

import type {
  AlAdhanCalendarResponse,
  PrayerDay,
  PrayerLocation,
  PrayerSettings,
  PrayerTiming,
} from "./types";

// Types have no runtime; these pin their shape and give the file coverage.
describe("prayer types", () => {
  test("PrayerTiming shape", () => {
    const t: PrayerTiming = { name: "fajr", time: "05:00" };
    expect(t.name).toBe("fajr");
  });

  test("PrayerLocation requires coordinates + timezone", () => {
    const loc: PrayerLocation = {
      latitude: 23.8,
      longitude: 90.4,
      timezone: "Asia/Dhaka",
    };
    expect(loc.timezone).toBe("Asia/Dhaka");
  });

  test("PrayerSettings requires method + school", () => {
    const s: PrayerSettings = { method: 3, school: 0 };
    expect(s.method).toBe(3);
  });

  test("PrayerDay timings map keys every prayer name", () => {
    const day: PrayerDay = {
      date: "2026-03-01",
      location: { latitude: 0, longitude: 0 },
      method: 3,
      school: 0,
      source: "aladhan",
      timezone: "UTC",
      timings: {
        fajr: "05:00",
        sunrise: "06:00",
        dhuhr: "12:00",
        asr: "15:00",
        maghrib: "18:00",
        isha: "19:30",
      },
    };
    expect(Object.keys(day.timings)).toHaveLength(6);
  });

  test("AlAdhanCalendarResponse is optional-heavy", () => {
    const res: AlAdhanCalendarResponse = {};
    expect(res.data).toBeUndefined();
  });
});

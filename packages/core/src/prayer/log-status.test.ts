import { describe, expect, it } from "bun:test";
import { classifyPrayerStatus, type PrayerSchedule } from "./log-status";

const SCHEDULE: PrayerSchedule = {
  fajr: "05:00",
  dhuhr: "12:00",
  asr: "15:30",
  maghrib: "18:30",
  isha: "20:00",
};

function utc(y: number, m: number, d: number, h: number, min: number): number {
  return Date.UTC(y, m - 1, d, h, min);
}

describe("classifyPrayerStatus", () => {
  it("returns on_time when prayed inside the prayer window", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 5, 30),
      prayer: "fajr",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("on_time");
  });

  it("returns early when prayed before scheduled start", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 4, 50),
      prayer: "fajr",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("early");
  });

  it("returns late when prayed after next prayer started, same day", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 12, 30),
      prayer: "fajr",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("late");
  });

  it("returns qada when prayed the next day past midnight", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 15, 0, 30),
      prayer: "fajr",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("qada");
  });

  it("classifies dhuhr prayed inside window as on_time", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 13, 0),
      prayer: "dhuhr",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("on_time");
  });

  it("classifies dhuhr after isha as late", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 20, 30),
      prayer: "dhuhr",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("late");
  });

  it("classifies isha inside window as on_time", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 20, 30),
      prayer: "isha",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("on_time");
  });

  it("classifies isha just before midnight as on_time", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 14, 23, 50),
      prayer: "isha",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("on_time");
  });

  it("classifies isha after midnight but before next fajr as on_time", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 15, 4, 30),
      prayer: "isha",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
    });
    expect(status).toBe("on_time");
  });

  it("classifies isha after next-day fajr as qada", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 15, 5, 30),
      prayer: "isha",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
      nextDayFajr: "05:00",
    });
    expect(status).toBe("qada");
  });

  it("uses provided nextDayFajr boundary for isha", () => {
    const before = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 15, 4, 0),
      prayer: "isha",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
      nextDayFajr: "04:30",
    });
    const after = classifyPrayerStatus({
      prayedAt: utc(2026, 5, 15, 5, 0),
      prayer: "isha",
      schedule: SCHEDULE,
      dateKey: "2026-05-14",
      timezone: "UTC",
      nextDayFajr: "04:30",
    });
    expect(before).toBe("on_time");
    expect(after).toBe("qada");
  });

  it("respects timezone when classifying wall-clock time", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 1, 1, 23, 30),
      prayer: "fajr",
      schedule: SCHEDULE,
      dateKey: "2026-01-02",
      timezone: "Asia/Dhaka",
    });
    expect(status).toBe("on_time");
  });

  it("rolls month boundary correctly for qada check", () => {
    const status = classifyPrayerStatus({
      prayedAt: utc(2026, 2, 1, 0, 30),
      prayer: "fajr",
      schedule: SCHEDULE,
      dateKey: "2026-01-31",
      timezone: "UTC",
    });
    expect(status).toBe("qada");
  });

  it("throws on invalid dateKey", () => {
    expect(() =>
      classifyPrayerStatus({
        prayedAt: utc(2026, 5, 14, 5, 30),
        prayer: "fajr",
        schedule: SCHEDULE,
        dateKey: "2026/05/14",
        timezone: "UTC",
      })
    ).toThrow();
  });

  it("throws on invalid schedule time", () => {
    expect(() =>
      classifyPrayerStatus({
        prayedAt: utc(2026, 5, 14, 5, 30),
        prayer: "fajr",
        schedule: { ...SCHEDULE, fajr: "5:00" },
        dateKey: "2026-05-14",
        timezone: "UTC",
      })
    ).toThrow();
  });
});

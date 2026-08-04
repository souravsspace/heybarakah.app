import { describe, expect, test } from "bun:test";
import type { PrayerDay } from "@barakah/core/prayer";
import type { Ayah } from "@/constants/ayahs";
import {
  type BuildSnapshotInput,
  buildWidgetSnapshot,
} from "@/lib/widget-snapshot";

const ISO_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00[+-]\d{2}:\d{2}$/;

function makeDay(overrides: Partial<Record<string, string>> = {}): PrayerDay {
  return {
    date: "2026-07-22",
    location: { latitude: 0, longitude: 0 },
    method: 2,
    school: 0,
    source: "aladhan" as PrayerDay["source"],
    timezone: "UTC",
    timings: {
      fajr: "05:00",
      sunrise: "06:30",
      dhuhr: "13:00",
      asr: "16:30",
      maghrib: "20:00",
      isha: "21:30",
      ...overrides,
    } as PrayerDay["timings"],
  };
}

const AYAH: Ayah = {
  arabic: "ذكر",
  translation: "remember",
  reference: "Al-Ankabut 29:45",
};

function makeInput(
  overrides: Partial<BuildSnapshotInput> = {}
): BuildSnapshotInput {
  return {
    ayah: AYAH,
    dhikrArabic: "سبحان الله",
    dhikrCount: 3,
    dhikrSessionTotal: 10,
    dhikrTarget: 33,
    streakBest: 5,
    streakDays: 2,
    streakHistory: [1, 1, 0],
    streakTodayDone: 4,
    timezone: "UTC",
    today: makeDay(),
    todayDateKey: "2026-07-22",
    tomorrow: null,
    ...overrides,
  };
}

describe("buildWidgetSnapshot", () => {
  test("builds five prayer entries with ISO adhan/start/end", () => {
    const snap = buildWidgetSnapshot(makeInput());
    expect(snap).not.toBeNull();
    expect(snap?.prayers).toHaveLength(5);
    for (const entry of snap?.prayers ?? []) {
      expect(entry.adhanISO).toMatch(ISO_LOCAL);
      expect(entry.startISO).toMatch(ISO_LOCAL);
      expect(entry.endISO).toMatch(ISO_LOCAL);
    }
    expect(snap?.prayers.map((p) => p.name)).toEqual([
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ]);
  });

  test("still builds a snapshot with empty prayers when today is null", () => {
    const snap = buildWidgetSnapshot(makeInput({ today: null }));
    expect(snap).not.toBeNull();
    expect(snap?.prayers).toEqual([]);
    expect(snap?.streak.days).toBe(2);
    expect(snap?.dhikr.count).toBe(3);
  });

  test("skips prayers with malformed / out-of-range timings", () => {
    const snap = buildWidgetSnapshot(
      makeInput({ today: makeDay({ asr: "bad", isha: "25:00" }) })
    );
    expect(snap?.prayers.map((p) => p.name)).toEqual([
      "fajr",
      "dhuhr",
      "maghrib",
    ]);
  });

  test("carries streak and dhikr payloads through", () => {
    const snap = buildWidgetSnapshot(makeInput());
    expect(snap?.streak).toEqual({
      days: 2,
      best: 5,
      history: [1, 1, 0],
      todayDone: 4,
    });
    expect(snap?.dhikr).toEqual({
      arabic: "سبحان الله",
      count: 3,
      target: 33,
      sessionTotal: 10,
    });
  });

  test("splits a 'Surah ref' reference into surah + reference", () => {
    const snap = buildWidgetSnapshot(makeInput());
    expect(snap?.ayah.surah).toBe("Al-Ankabut");
    expect(snap?.ayah.reference).toBe("29:45");
    expect(snap?.ayah.arabic).toBe("ذكر");
    expect(snap?.ayah.translation).toBe("remember");
  });

  test("reference with no space keeps whole string as surah", () => {
    const snap = buildWidgetSnapshot(
      makeInput({ ayah: { ...AYAH, reference: "Basmala" } })
    );
    expect(snap?.ayah.surah).toBe("Basmala");
    expect(snap?.ayah.reference).toBe("");
  });

  test("populates tomorrowFajrISO only when tomorrow is provided and valid", () => {
    expect(
      buildWidgetSnapshot(makeInput({ tomorrow: null }))?.tomorrowFajrISO
    ).toBeNull();
    const withTomorrow = buildWidgetSnapshot(
      makeInput({
        tomorrow: { ...makeDay(), date: "2026-07-23" },
      })
    );
    expect(withTomorrow?.tomorrowFajrISO).toMatch(ISO_LOCAL);

    const badTomorrow = buildWidgetSnapshot(
      makeInput({
        tomorrow: { ...makeDay({ fajr: "nope" }), date: "2026-07-23" },
      })
    );
    expect(badTomorrow?.tomorrowFajrISO).toBeNull();
  });

  test("sets version, timezone, date, lockNow and an ISO generatedAt", () => {
    const snap = buildWidgetSnapshot(makeInput());
    expect(snap?.v).toBe(1);
    expect(snap?.tz).toBe("UTC");
    expect(snap?.date).toBe("2026-07-22");
    expect(snap?.lockNow).toBeNull();
    expect(new Date(snap?.generatedAt ?? "").toString()).not.toBe(
      "Invalid Date"
    );
  });
});

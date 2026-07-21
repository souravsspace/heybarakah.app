import type { PrayerDay } from "@barakah/core/prayer";
import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import {
  activePrayerNow,
  dateKey,
  fmtRangeTime,
  pad2,
  PRAYER_ORDER,
} from "@/lib/date-utils";

function makeDay(timings: Partial<Record<string, string>>): PrayerDay {
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
      ...timings,
    } as PrayerDay["timings"],
  };
}

afterEach(() => {
  setSystemTime(); // restore real clock
});

describe("pad2", () => {
  test("pads single digits, leaves two-digit alone", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(0)).toBe("00");
    expect(pad2(12)).toBe("12");
  });
});

describe("PRAYER_ORDER", () => {
  test("is the five daily prayers in order", () => {
    expect(PRAYER_ORDER).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
  });
});

describe("dateKey", () => {
  test("formats a given date as YYYY-MM-DD (local)", () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(dateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("fmtRangeTime", () => {
  test("morning uses 'a', afternoon uses 'p'", () => {
    const d = new Date(2026, 0, 1);
    d.setHours(6, 5);
    expect(fmtRangeTime(d)).toBe("6:05a");
    d.setHours(19, 30);
    expect(fmtRangeTime(d)).toBe("7:30p");
  });

  test("midnight and noon render as 12", () => {
    const d = new Date(2026, 0, 1);
    d.setHours(0, 0);
    expect(fmtRangeTime(d)).toBe("12:00a");
    d.setHours(12, 0);
    expect(fmtRangeTime(d)).toBe("12:00p");
  });
});

describe("activePrayerNow", () => {
  test("null day → null", () => {
    expect(activePrayerNow(null)).toBeNull();
  });

  test("before fajr → null", () => {
    setSystemTime(new Date(2026, 6, 22, 4, 30));
    expect(activePrayerNow(makeDay({}))).toBeNull();
  });

  test("returns the latest passed prayer", () => {
    setSystemTime(new Date(2026, 6, 22, 17, 0)); // after asr (16:30), before maghrib
    expect(activePrayerNow(makeDay({}))).toBe("asr");
  });

  test("after isha → isha", () => {
    setSystemTime(new Date(2026, 6, 22, 23, 0));
    expect(activePrayerNow(makeDay({}))).toBe("isha");
  });

  test("exactly at a prayer time counts as active (<=)", () => {
    setSystemTime(new Date(2026, 6, 22, 13, 0)); // exactly dhuhr
    expect(activePrayerNow(makeDay({}))).toBe("dhuhr");
  });

  test("skips prayers with malformed timings", () => {
    setSystemTime(new Date(2026, 6, 22, 17, 0));
    // asr malformed → falls back to dhuhr as latest valid passed prayer
    expect(activePrayerNow(makeDay({ asr: "oops" }))).toBe("dhuhr");
  });
});

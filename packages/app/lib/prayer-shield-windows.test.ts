import { describe, expect, test } from "bun:test";
import type { PrayerWindow } from "@barakah/core/shieldSelection";
import {
  computeWindows,
  isInsideAnyShieldWindow,
  MIN_DEVICE_ACTIVITY_MINUTES,
  parseHHmm,
  remainingShieldMinutes,
  type Timings,
  toBlockWindows,
} from "@/lib/prayer-shield-windows";
import {
  lockBoundsMinutes,
  PRAYER_OFFSET_MIN,
} from "@/lib/prayer-window-config";

/**
 * These lock the salah shield window math — the exact logic that decides which
 * DeviceActivity intervals get registered and therefore whether apps go quiet
 * at prayer time. A silent bug here is invisible on-device (the shield simply
 * never engages), so it must be pinned by tests.
 */

const TIMINGS: Timings = {
  fajr: "05:00",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:20",
  isha: "20:00",
};

const ALL: PrayerWindow[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function minuteOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

describe("parseHHmm", () => {
  test("parses valid times to minutes since midnight", () => {
    expect(parseHHmm("00:00")).toBe(0);
    expect(parseHHmm("05:30")).toBe(330);
    expect(parseHHmm("23:59")).toBe(1439);
  });

  test("rejects out-of-range and malformed input", () => {
    expect(parseHHmm("24:00")).toBeNull();
    expect(parseHHmm("12:60")).toBeNull();
    expect(parseHHmm("-1:00")).toBeNull();
    expect(parseHHmm("")).toBeNull();
    expect(parseHHmm("abc")).toBeNull();
  });
});

describe("computeWindows", () => {
  test("produces one window per requested prayer, sorted by start", () => {
    const out = computeWindows(ALL, TIMINGS);
    expect(out.map((w) => w.name)).toEqual([
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ]);
    for (let i = 1; i < out.length; i++) {
      expect(out[i].start).toBeGreaterThanOrEqual(out[i - 1].start);
    }
  });

  test("window is centered on adhan + prayer offset", () => {
    const [fajr] = computeWindows(["fajr"], TIMINGS);
    const adhan = minuteOf(TIMINGS.fajr);
    const expected = lockBoundsMinutes("fajr", adhan);
    expect(fajr.start).toBe(expected.start);
    expect(fajr.end).toBe(Math.min(expected.end, 1440));
    // offset actually applied
    expect(fajr.start).toBeGreaterThan(adhan);
    expect(PRAYER_OFFSET_MIN.fajr).toBeGreaterThan(0);
  });

  test("skips prayers with malformed timings, keeps the rest", () => {
    const out = computeWindows(ALL, { ...TIMINGS, asr: "bad" });
    expect(out.map((w) => w.name)).not.toContain("asr");
    expect(out).toHaveLength(4);
  });

  test("skips a window that starts past midnight", () => {
    // Isha adhan 23:55 + 60-min offset pushes start well past 1440.
    const out = computeWindows(["isha"], { ...TIMINGS, isha: "23:55" });
    expect(out).toHaveLength(0);
  });
});

describe("toBlockWindows", () => {
  test("every prayer produces a registrable window (never silently dropped)", () => {
    const computed = computeWindows(ALL, TIMINGS);
    const blocks = toBlockWindows(computed);
    expect(blocks).toHaveLength(computed.length);
    expect(blocks).toHaveLength(5);
  });

  test("every registered interval clears the DeviceActivity floor", () => {
    const blocks = toBlockWindows(computeWindows(ALL, TIMINGS));
    for (const b of blocks) {
      const start = b.startHour * 60 + b.startMinute;
      const end = b.endHour * 60 + b.endMinute;
      expect(end - start).toBeGreaterThanOrEqual(MIN_DEVICE_ACTIVITY_MINUTES);
    }
  });

  test("extends a sub-floor window instead of dropping it", () => {
    // A hand-built 15-minute window (exactly the effective lock duration).
    const blocks = toBlockWindows([{ name: "dhuhr", start: 750, end: 765 }]);
    expect(blocks).toHaveLength(1);
    const start = blocks[0].startHour * 60 + blocks[0].startMinute;
    const end = blocks[0].endHour * 60 + blocks[0].endMinute;
    expect(start).toBe(750);
    expect(end - start).toBe(MIN_DEVICE_ACTIVITY_MINUTES);
  });

  test("a window clamped near midnight still clears the floor by pulling start back", () => {
    // Start at 23:50 (1430); floor would push end to 1446 > 1439.
    const blocks = toBlockWindows([{ name: "isha", start: 1430, end: 1440 }]);
    expect(blocks).toHaveLength(1);
    const start = blocks[0].startHour * 60 + blocks[0].startMinute;
    const end = blocks[0].endHour * 60 + blocks[0].endMinute;
    expect(end).toBeLessThanOrEqual(1439);
    expect(end - start).toBeGreaterThanOrEqual(MIN_DEVICE_ACTIVITY_MINUTES);
  });

  test("empty input yields empty output", () => {
    expect(toBlockWindows([])).toEqual([]);
  });
});

describe("remainingShieldMinutes", () => {
  // dhuhr adhan 12:30 (750) + 45 offset = 13:15 midpoint → window 13:07–13:23.
  const START = 787;
  const END = 803;

  const at = (minuteOfDay: number): Date => {
    const d = new Date(2026, 0, 1);
    d.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
    return d;
  };

  test("covers the whole registered window from its first minute", () => {
    // The registered interval is 16 minutes wide. Capping this at
    // LOCK_DURATION_MIN (15) expired the unlock while the OS still considered
    // the window open, so the native relock re-shielded a user who had just
    // marked the prayer as prayed.
    expect(remainingShieldMinutes("dhuhr", TIMINGS, at(START))).toBe(
      END - START
    );
  });

  test("shrinks as the window elapses", () => {
    expect(remainingShieldMinutes("dhuhr", TIMINGS, at(START + 10))).toBe(6);
    expect(remainingShieldMinutes("dhuhr", TIMINGS, at(END - 1))).toBe(1);
  });

  test("is zero outside the window", () => {
    expect(remainingShieldMinutes("dhuhr", TIMINGS, at(START - 1))).toBe(0);
    expect(remainingShieldMinutes("dhuhr", TIMINGS, at(END))).toBe(0);
  });

  test("is zero without usable timings", () => {
    expect(remainingShieldMinutes("dhuhr", null, at(START))).toBe(0);
    expect(remainingShieldMinutes("dhuhr", undefined, at(START))).toBe(0);
    expect(
      remainingShieldMinutes("dhuhr", { ...TIMINGS, dhuhr: "25:99" }, at(START))
    ).toBe(0);
  });

  test("never outlives the window it unlocks", () => {
    for (let m = START; m < END; m++) {
      expect(m + remainingShieldMinutes("dhuhr", TIMINGS, at(m))).toBe(END);
    }
  });
});

describe("isInsideAnyShieldWindow", () => {
  const at = (minuteOfDay: number): Date => {
    const d = new Date(2026, 0, 1);
    d.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
    return d;
  };

  test("true only while one of the given windows is open", () => {
    // dhuhr window is 13:07–13:23 for a 12:30 adhan.
    expect(isInsideAnyShieldWindow(["dhuhr"], TIMINGS, at(790))).toBe(true);
    expect(isInsideAnyShieldWindow(["dhuhr"], TIMINGS, at(700))).toBe(false);
    expect(isInsideAnyShieldWindow(["fajr"], TIMINGS, at(790))).toBe(false);
  });

  test("false for an empty selection or missing timings", () => {
    expect(isInsideAnyShieldWindow([], TIMINGS, at(790))).toBe(false);
    expect(isInsideAnyShieldWindow(["dhuhr"], null, at(790))).toBe(false);
  });
});

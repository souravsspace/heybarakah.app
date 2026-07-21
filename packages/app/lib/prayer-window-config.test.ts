import { describe, expect, test } from "bun:test";
import type { PrayerWindow } from "@barakah/core/shieldSelection";
import {
  LOCK_DURATION_MIN,
  lockBoundsMinutes,
  midpointMinutesForPrayer,
  PRAYER_OFFSET_MIN,
} from "@/lib/prayer-window-config";

const ALL: PrayerWindow[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

describe("midpointMinutesForPrayer", () => {
  test("adds the per-prayer offset to the adhan minute", () => {
    for (const p of ALL) {
      expect(midpointMinutesForPrayer(p, 600)).toBe(600 + PRAYER_OFFSET_MIN[p]);
    }
  });
});

describe("lockBoundsMinutes", () => {
  test("window spans the full lock duration around the midpoint", () => {
    for (const p of ALL) {
      const { start, end } = lockBoundsMinutes(p, 600);
      // floor(mid - 7.5) .. ceil(mid + 7.5) → 15 or 16 whole minutes.
      expect(end - start).toBeGreaterThanOrEqual(LOCK_DURATION_MIN);
      expect(end - start).toBeLessThanOrEqual(LOCK_DURATION_MIN + 1);
    }
  });

  test("midpoint sits inside the window", () => {
    const adhan = 600;
    const { start, end } = lockBoundsMinutes("dhuhr", adhan);
    const mid = midpointMinutesForPrayer("dhuhr", adhan);
    expect(mid).toBeGreaterThanOrEqual(start);
    expect(mid).toBeLessThan(end);
  });

  test("bounds are whole minutes", () => {
    const { start, end } = lockBoundsMinutes("asr", 933);
    expect(Number.isInteger(start)).toBe(true);
    expect(Number.isInteger(end)).toBe(true);
  });
});

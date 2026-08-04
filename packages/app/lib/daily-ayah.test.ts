import { describe, expect, test } from "bun:test";
import { AYAHS } from "@/constants/ayahs";
import { pickDailyAyah } from "@/lib/daily-ayah";

describe("pickDailyAyah", () => {
  test("returns an ayah from the pool", () => {
    expect(AYAHS).toContain(pickDailyAyah("2026-07-22"));
  });

  test("is deterministic for the same date key", () => {
    expect(pickDailyAyah("2026-07-22")).toBe(pickDailyAyah("2026-07-22"));
  });

  test("different keys generally map to different ayahs", () => {
    const picks = new Set(
      Array.from({ length: 30 }, (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        return AYAHS.indexOf(pickDailyAyah(`2026-07-${day}`));
      })
    );
    // hashing across 30 consecutive days should not collapse to one ayah
    expect(picks.size).toBeGreaterThan(1);
  });

  test("always within array bounds for varied keys", () => {
    for (const key of ["", "x", "2026-01-01", "9999-99-99", "🌙"]) {
      const idx = AYAHS.indexOf(pickDailyAyah(key));
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(AYAHS.length);
    }
  });
});

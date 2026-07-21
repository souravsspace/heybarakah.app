import { describe, expect, test } from "bun:test";

import {
  ALADHAN_BASE_URL,
  ALADHAN_METHOD_IDS,
  APP_CALC_METHOD_TO_ALADHAN_METHOD,
  BANGLADESH_DEFAULT_PRAYER_SETTINGS,
  COORDINATE_PRECISION,
  DEFAULT_PRAYER_DAYS,
  GLOBAL_DEFAULT_PRAYER_SETTINGS,
  NOTIFIABLE_PRAYER_NAMES,
  PRAYER_CACHE_TTL_MS,
  PRAYER_NAMES,
} from "./constants";

describe("scalar constants", () => {
  test("cache TTL is seven days in ms", () => {
    expect(PRAYER_CACHE_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test("default days and precision", () => {
    expect(DEFAULT_PRAYER_DAYS).toBe(7);
    expect(COORDINATE_PRECISION).toBe(4);
  });

  test("aladhan base url has no trailing slash", () => {
    expect(ALADHAN_BASE_URL).toBe("https://api.aladhan.com/v1");
    expect(ALADHAN_BASE_URL.endsWith("/")).toBe(false);
  });
});

describe("prayer name lists", () => {
  test("PRAYER_NAMES has the six canonical names in order", () => {
    expect(PRAYER_NAMES).toEqual([
      "fajr",
      "sunrise",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ]);
  });

  test("NOTIFIABLE excludes sunrise, keeps the other five", () => {
    expect(NOTIFIABLE_PRAYER_NAMES).toEqual([
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ]);
    expect(NOTIFIABLE_PRAYER_NAMES).not.toContain("sunrise");
  });
});

describe("method id maps", () => {
  test("method ids match Aladhan documented values", () => {
    expect(ALADHAN_METHOD_IDS.KARACHI).toBe(1);
    expect(ALADHAN_METHOD_IDS.ISNA).toBe(2);
    expect(ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE).toBe(3);
    expect(ALADHAN_METHOD_IDS.UMM_AL_QURA).toBe(4);
  });

  test("bangladesh default uses Karachi + Hanafi school", () => {
    expect(BANGLADESH_DEFAULT_PRAYER_SETTINGS).toEqual({
      method: ALADHAN_METHOD_IDS.KARACHI,
      school: 1,
    });
  });

  test("global default uses MWL + Shafi school", () => {
    expect(GLOBAL_DEFAULT_PRAYER_SETTINGS).toEqual({
      method: ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE,
      school: 0,
    });
  });

  test("every app calc method maps to a real Aladhan id", () => {
    const ids = new Set(Object.values(ALADHAN_METHOD_IDS));
    for (const id of Object.values(APP_CALC_METHOD_TO_ALADHAN_METHOD)) {
      expect(ids.has(id)).toBe(true);
    }
  });

  test("custom method falls back to MWL", () => {
    expect(APP_CALC_METHOD_TO_ALADHAN_METHOD.custom).toBe(
      ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE
    );
  });
});

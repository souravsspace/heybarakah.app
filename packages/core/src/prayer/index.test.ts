import { describe, expect, test } from "bun:test";

import * as prayer from "./index";

describe("prayer barrel", () => {
  test("re-exports adhan-js helpers", () => {
    expect(typeof prayer.getAdhanJsCalculationParameters).toBe("function");
    expect(typeof prayer.isAdhanJsSupportedMethod).toBe("function");
    expect(typeof prayer.calculateAdhanJsPrayerDays).toBe("function");
  });

  test("re-exports aladhan helpers", () => {
    expect(typeof prayer.createAlAdhanCalendarUrl).toBe("function");
    expect(typeof prayer.normalizeAlAdhanCalendarResponse).toBe("function");
  });

  test("re-exports cache-key helpers", () => {
    expect(typeof prayer.roundCoordinate).toBe("function");
    expect(typeof prayer.createPrayerTimesCacheKey).toBe("function");
  });

  test("re-exports log-status + normalize helpers", () => {
    expect(typeof prayer.classifyPrayerStatus).toBe("function");
    expect(typeof prayer.formatDateKey).toBe("function");
    expect(typeof prayer.addDays).toBe("function");
  });

  test("re-exports constants", () => {
    expect(prayer.DEFAULT_PRAYER_DAYS).toBe(7);
    expect(Array.isArray(prayer.PRAYER_NAMES)).toBe(true);
  });
});

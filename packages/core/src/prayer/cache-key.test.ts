import { describe, expect, test } from "bun:test";
import {
  createPrayerTimesCacheKey,
  createUserPrayerTimesCacheKey,
  roundCoordinate,
} from "./cache-key";

describe("prayer cache keys", () => {
  test("rounds coordinates to 4 decimals", () => {
    expect(roundCoordinate(23.810_332_1)).toBe(23.8103);
    expect(roundCoordinate(90.412_518_8)).toBe(90.4125);
  });

  test("includes date range and calculation settings", () => {
    const key = createPrayerTimesCacheKey({
      latitude: 23.810_332_1,
      longitude: 90.412_518_8,
      timezone: "Asia/Dhaka",
      method: 1,
      school: 1,
      latitudeAdjustmentMethod: 3,
      midnightMode: 0,
      tune: "0,0,0,0,0,0,0,0,0",
      startDate: "2026-05-11",
      days: 7,
    });

    expect(key).toBe(
      "prayer:v1:lat=23.8103:lng=90.4125:tz=Asia/Dhaka:method=1:school=1:latAdj=3:midnight=0:tune=0,0,0,0,0,0,0,0,0:start=2026-05-11:days=7"
    );
  });

  test("wraps cache key by user or anonymous scope", () => {
    const cacheKey =
      "prayer:v1:lat=1:lng=2:tz=UTC:method=3:school=0:latAdj=:midnight=:tune=:start=2026-05-11:days=7";

    expect(createUserPrayerTimesCacheKey(cacheKey, "user_123")).toBe(
      `user:user_123:${cacheKey}`
    );
    expect(createUserPrayerTimesCacheKey(cacheKey)).toBe(`anon:${cacheKey}`);
  });
});

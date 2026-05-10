import { COORDINATE_PRECISION } from "./constants";
import type { PrayerTimesCacheKeyInput } from "./types";

export function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_PRECISION;
  return Math.round(value * factor) / factor;
}

export function createPrayerTimesCacheKey(
  input: PrayerTimesCacheKeyInput
): string {
  const latitudeRounded = roundCoordinate(input.latitude);
  const longitudeRounded = roundCoordinate(input.longitude);

  return [
    "prayer:v1",
    `lat=${latitudeRounded.toFixed(COORDINATE_PRECISION)}`,
    `lng=${longitudeRounded.toFixed(COORDINATE_PRECISION)}`,
    `tz=${input.timezone}`,
    `method=${input.method}`,
    `school=${input.school}`,
    `latAdj=${input.latitudeAdjustmentMethod ?? ""}`,
    `midnight=${input.midnightMode ?? ""}`,
    `tune=${input.tune ?? ""}`,
    `start=${input.startDate}`,
    `days=${input.days}`,
  ].join(":");
}

export function createUserPrayerTimesCacheKey(
  cacheKey: string,
  userId?: string | null
): string {
  return userId ? `user:${userId}:${cacheKey}` : `anon:${cacheKey}`;
}

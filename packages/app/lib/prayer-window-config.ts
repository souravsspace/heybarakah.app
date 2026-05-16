import type { PrayerWindow } from "@barakah/core/shieldSelection";

export const PRAYER_OFFSET_MIN: Record<PrayerWindow, number> = {
  fajr: 10,
  dhuhr: 45,
  asr: 45,
  maghrib: 10,
  isha: 60,
};

export const LOCK_DURATION_MIN = 15;

export const NOTIF_LEAD_MIN = 1;

export function midpointMinutesForPrayer(
  window: PrayerWindow,
  adhanMinutes: number
): number {
  return adhanMinutes + PRAYER_OFFSET_MIN[window];
}

export function lockBoundsMinutes(
  window: PrayerWindow,
  adhanMinutes: number
): { start: number; end: number } {
  const mid = midpointMinutesForPrayer(window, adhanMinutes);
  const half = LOCK_DURATION_MIN / 2;
  return { start: mid - half, end: mid + half };
}

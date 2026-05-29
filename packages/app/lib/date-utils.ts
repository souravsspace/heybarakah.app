import type { PrayerDay } from "@barakah/core/prayer";
import type { PrayerName } from "@/lib/widgets-native";

export const PRAYER_ORDER: readonly PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/** Zero-pad a number to two digits (e.g. 3 → "03"). */
export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Local-time YYYY-MM-DD key. Defaults to today. */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Short range-style clock label, e.g. "6:05a" / "7:30p". */
export function fmtRangeTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "p" : "a";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad2(m)}${period}`;
}

/** The latest prayer whose adhan time has already passed today, or null. */
export function activePrayerNow(day: PrayerDay | null): PrayerName | null {
  if (!day) {
    return null;
  }
  const now = new Date();
  let active: PrayerName | null = null;
  for (const name of PRAYER_ORDER) {
    const [h, m] = day.timings[name].split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      continue;
    }
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    if (at <= now) {
      active = name;
    }
  }
  return active;
}

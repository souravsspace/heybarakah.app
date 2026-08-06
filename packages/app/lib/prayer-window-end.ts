import { ALL_WINDOWS, type PrayerWindow } from "@barakah/core/shieldSelection";
import { parseHHmm, type Timings } from "@/lib/prayer-shield-windows";

// Minute-of-day at which `prayer`'s time expires, or null when the schedule
// can't be read. The value may exceed 1440 for isha, whose window runs past
// midnight — callers building a Date should add it to that day's midnight.
//
// Every prayer but isha expires when the next one is called. Isha expires at
// Islamic midnight (the midpoint between maghrib and the following fajr) rather
// than at fajr itself: the fiqh boundary for its preferred time, and the only
// one that doesn't put a "hurry up" reminder in the middle of the night.
export function prayerWindowEndMinutes(
  prayer: PrayerWindow,
  timings: Timings | null | undefined,
  nextDayFajr?: string | null
): number | null {
  if (!timings) {
    return null;
  }
  const idx = ALL_WINDOWS.indexOf(prayer);
  if (idx < 0) {
    return null;
  }
  if (idx < ALL_WINDOWS.length - 1) {
    return parseHHmm(timings[ALL_WINDOWS[idx + 1]]);
  }
  const maghrib = parseHHmm(timings.maghrib);
  const fajr = parseHHmm(nextDayFajr ?? timings.fajr);
  if (maghrib === null || fajr === null) {
    return null;
  }
  return maghrib + Math.floor((fajr + 1440 - maghrib) / 2);
}

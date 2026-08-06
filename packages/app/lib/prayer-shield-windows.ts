import type { PrayerWindow } from "@barakah/core/shieldSelection";
import type { PrayerBlockWindow } from "@/lib/app-blocker";
import { lockBoundsMinutes } from "@/lib/prayer-window-config";

export interface Timings {
  asr: string;
  dhuhr: string;
  fajr: string;
  isha: string;
  maghrib: string;
}

export interface ComputedWindow {
  end: number;
  name: PrayerWindow;
  start: number;
}

// DeviceActivity rejects/unreliably fires schedules shorter than 15 minutes.
// The effective shield window (LOCK_DURATION_MIN) is 15, which sits exactly on
// that floor — boundary schedules are the observed cause of salah windows that
// never engage. Register the OS window at a hair above the floor so
// `intervalDidStart` fires reliably; the foreground backstop still lifts the
// shield at the real 15-minute mark (or the moment the prayer is logged).
export const MIN_DEVICE_ACTIVITY_MINUTES = 16;

// Highest minute-of-day a DateComponents-based schedule can express (23:59).
const DAY_END_MINUTE = 1439;

export function parseHHmm(time: string): number | null {
  const parts = time.split(":");
  if (parts.length !== 2) {
    return null;
  }
  const [h, m] = parts.map(Number);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return h * 60 + m;
}

export function computeWindows(
  windows: PrayerWindow[],
  timings: Timings
): ComputedWindow[] {
  const out: ComputedWindow[] = [];
  for (const name of windows) {
    const adhan = parseHHmm(timings[name]);
    if (adhan === null) {
      continue;
    }
    const { start, end } = lockBoundsMinutes(name, adhan);
    if (start >= 1440) {
      continue;
    }
    out.push({ name, start, end: Math.min(end, 1440) });
  }
  return out.sort((a, b) => a.start - b.start);
}

// Minutes left in the shield window actually registered with the OS for
// `prayer`, or 0 when `now` sits outside it.
//
// `lockBoundsMinutes` describes the logical LOCK_DURATION_MIN window, but the
// registered interval is padded up to MIN_DEVICE_ACTIVITY_MINUTES by
// `toBlockWindows` and the native relock re-shields against *that* window. An
// unlock sized to the logical window therefore expires while the OS still
// considers the window open, putting the shield back on a user who just prayed.
export function remainingShieldMinutes(
  prayer: PrayerWindow,
  timings: Timings | null | undefined,
  now: Date = new Date()
): number {
  if (!timings) {
    return 0;
  }
  const adhan = parseHHmm(timings[prayer]);
  if (adhan === null) {
    return 0;
  }
  const { start, end } = lockBoundsMinutes(prayer, adhan);
  const osEnd = Math.max(end, start + MIN_DEVICE_ACTIVITY_MINUTES);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < start || nowMin >= osEnd) {
    return 0;
  }
  return Math.max(1, osEnd - nowMin);
}

// Map computed shield windows to the OS DeviceActivity schedule payload. A
// window clipped below the DeviceActivity floor (e.g. one clamped at midnight,
// or the exact-15-minute effective window) is *extended* to the floor rather
// than dropped — dropping silently left that prayer unshielded, which is the
// reported "apps don't lock at salah" failure.
export function toBlockWindows(windows: ComputedWindow[]): PrayerBlockWindow[] {
  const out: PrayerBlockWindow[] = [];
  for (const w of windows) {
    // DateComponents has no hour 24; clamp a midnight end to 23:59.
    let start = w.start;
    let end = Math.min(w.end, DAY_END_MINUTE);
    if (end - start < MIN_DEVICE_ACTIVITY_MINUTES) {
      end = start + MIN_DEVICE_ACTIVITY_MINUTES;
      if (end > DAY_END_MINUTE) {
        // Pushed past midnight: pull the start back so the interval still clears
        // the floor without wrapping past 23:59.
        end = DAY_END_MINUTE;
        start = Math.max(0, end - MIN_DEVICE_ACTIVITY_MINUTES);
      }
    }
    out.push({
      endHour: Math.floor(end / 60),
      endMinute: end % 60,
      name: w.name,
      startHour: Math.floor(start / 60),
      startMinute: start % 60,
    });
  }
  return out;
}

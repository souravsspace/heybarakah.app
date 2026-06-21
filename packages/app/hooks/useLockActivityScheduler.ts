import type { PrayerDay } from "@barakah/core/prayer";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useWeekLogs } from "@/hooks/usePrayerLogs";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { dateKey, PRAYER_ORDER, pad2 } from "@/lib/date-utils";
import { lockBoundsMinutes } from "@/lib/prayer-window-config";
import {
  endAllLockActivities,
  endLockActivity,
  type PrayerName,
  startLockActivity,
} from "@/lib/widgets-native";

const TICK_MS = 30_000;

function adhanMinutes(hhmm: string): number | null {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return null;
  }
  return h * 60 + m;
}

function nowMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function localISO(d: Date): string {
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const oh = pad2(Math.floor(abs / 60));
  const om = pad2(abs % 60);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}${sign}${oh}:${om}`;
}

function findActiveLock(
  day: PrayerDay,
  now: Date
): { name: PrayerName; start: Date; end: Date } | null {
  const minutes = nowMinutes(now);
  for (const name of PRAYER_ORDER) {
    const raw = (day.timings as Record<string, string>)[name];
    if (!raw) {
      continue;
    }
    const adhan = adhanMinutes(raw);
    if (adhan === null) {
      continue;
    }
    const bounds = lockBoundsMinutes(name, adhan);
    // Clamp a window that crossed midnight to 23:59. Without this, `bounds.end`
    // exceeds 1440, `minutes < bounds.end` is always true, and `setHours(24, …)`
    // rolls the end to tomorrow — so the Live Activity would never end until the
    // day key flips. Mirrors the shield's clamp in usePrayerShield.
    const boundsEnd = Math.min(bounds.end, 1439);
    if (minutes >= bounds.start && minutes < boundsEnd) {
      const start = new Date(now);
      start.setHours(Math.floor(bounds.start / 60), bounds.start % 60, 0, 0);
      const end = new Date(now);
      end.setHours(Math.floor(boundsEnd / 60), boundsEnd % 60, 0, 0);
      return { name, start, end };
    }
  }
  return null;
}

export function useLockActivityScheduler(): void {
  const { prayerTimes } = usePrayerTimes();
  const today = dateKey();
  const week = useWeekLogs(today);
  const weekRef = useRef(week);
  weekRef.current = week;
  // Changes whenever a prayer is logged/cleared today, so the effect re-runs and
  // tears down a Live Activity the moment its prayer is marked prayed.
  const loggedKey = week.rows
    .filter((row) => row.date === today)
    .map((row) => row.prayer)
    .sort()
    .join(",");
  const currentActivityId = useRef<string | null>(null);
  const currentKey = useRef<string | null>(null);
  const inFlight = useRef(false);
  const bootstrapped = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function tick(): Promise<void> {
      if (inFlight.current) {
        return;
      }
      inFlight.current = true;
      try {
        await tickBody();
      } finally {
        inFlight.current = false;
      }
    }

    async function tickBody(): Promise<void> {
      if (!bootstrapped.current) {
        bootstrapped.current = true;
        try {
          await endAllLockActivities();
        } catch {
          // ignore
        }
      }
      const now = new Date();
      const dayKey = dateKey(now);
      const day = prayerTimes.find((item) => item.date === dayKey);
      if (!day) {
        return;
      }
      const active = findActiveLock(day, now);
      // Already prayed this window -> no Live Activity. End any running one.
      const activeLogged = active
        ? Boolean(weekRef.current.getStatus(dayKey, active.name))
        : false;
      if (!active || activeLogged) {
        if (currentActivityId.current) {
          const id = currentActivityId.current;
          currentActivityId.current = null;
          currentKey.current = null;
          try {
            await endLockActivity(id);
          } catch {
            // ignore
          }
        }
        return;
      }
      const key = `${dayKey}:${active.name}`;
      if (currentKey.current === key) {
        return;
      }
      if (currentActivityId.current) {
        try {
          await endLockActivity(currentActivityId.current);
        } catch {
          // ignore
        }
        currentActivityId.current = null;
      }
      try {
        const id = await startLockActivity({
          name: active.name,
          startISO: localISO(active.start),
          endISO: localISO(active.end),
        });
        if (cancelled) {
          // Effect was torn down while we awaited start; end the orphan now so
          // it doesn't accumulate against the ActivityKit limit.
          try {
            await endLockActivity(id);
          } catch {
            // ignore
          }
        } else {
          currentActivityId.current = id;
          currentKey.current = key;
        }
      } catch {
        // ActivityKit may be disabled or unsupported on this device.
      }
    }

    tick();
    const interval = setInterval(tick, TICK_MS);
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        tick();
      }
    });
    return () => {
      cancelled = true;
      clearInterval(interval);
      sub.remove();
    };
  }, [prayerTimes, loggedKey]);
}

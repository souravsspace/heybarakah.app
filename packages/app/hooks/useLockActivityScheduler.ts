import type { PrayerDay } from "@barakah/core/prayer";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { dateKey, PRAYER_ORDER, pad2 } from "@/lib/date-utils";
import { lockBoundsMinutes } from "@/lib/prayer-window-config";
import { ensureWidgetIconUri } from "@/lib/widget-icon";
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
    if (minutes >= bounds.start && minutes < bounds.end) {
      const start = new Date(now);
      start.setHours(Math.floor(bounds.start / 60), bounds.start % 60, 0, 0);
      const end = new Date(now);
      end.setHours(Math.floor(bounds.end / 60), bounds.end % 60, 0, 0);
      return { name, start, end };
    }
  }
  return null;
}

export function useLockActivityScheduler(): void {
  const { prayerTimes } = usePrayerTimes();
  const currentActivityId = useRef<string | null>(null);
  const currentKey = useRef<string | null>(null);
  const inFlight = useRef(false);
  const bootstrapped = useRef(false);
  const iconUri = useRef<string | undefined>(undefined);

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
          iconUri.current = (await ensureWidgetIconUri()) ?? undefined;
        } catch {
          // fall back to the SF Symbol moon when the mark can't be staged
        }
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
      if (!active) {
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
          iconUri: iconUri.current,
        });
        if (!cancelled) {
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
  }, [prayerTimes]);
}

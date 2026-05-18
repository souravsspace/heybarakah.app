import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { consumePendingDhikr, setSnapshot } from "expo-widget-bridge";
import { useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";
import { useDhikrIncrementBridge } from "@/hooks/useDhikrIncrementBridge";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { pickDailyAyah } from "@/lib/daily-ayah";
import { buildWidgetSnapshot } from "@/lib/widget-snapshot";

const DEBOUNCE_MS = 800;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function useWidgetSync(): void {
  const { prayerTimes } = usePrayerTimes();
  const today = todayKey();
  const tomorrow = tomorrowKey();

  const streak = useQuery(api.lib.prayerLogs.getStreak, { today });
  const dhikr = useQuery(api.lib.dhikr.getToday, { date: today });

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  const ayah = useMemo(() => pickDailyAyah(today), [today]);

  const lastJson = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const todayDay = prayerTimes.find((item) => item.date === today) ?? null;
    const tomorrowDay =
      prayerTimes.find((item) => item.date === tomorrow) ?? null;

    const snapshot = buildWidgetSnapshot({
      today: todayDay,
      tomorrow: tomorrowDay,
      todayDateKey: today,
      timezone,
      streakDays: streak?.days ?? 0,
      dhikrCount: dhikr?.count ?? 0,
      dhikrTarget: dhikr?.target ?? 33,
      ayah,
    });
    if (!snapshot) {
      return;
    }
    const json = JSON.stringify(snapshot);
    if (json === lastJson.current) {
      return;
    }
    lastJson.current = json;

    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setSnapshot(snapshot).catch(() => {
        // Widget bridge is iOS-only and may no-op on other platforms.
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [
    ayah,
    dhikr?.count,
    dhikr?.target,
    prayerTimes,
    streak?.days,
    timezone,
    today,
    tomorrow,
  ]);

  useDhikrReconciliation(today);
  useDhikrIncrementBridge();
}

function useDhikrReconciliation(today: string): void {
  const increment = useMutation(api.lib.dhikr.increment);
  useEffect(() => {
    let cancelled = false;
    async function drain(): Promise<void> {
      try {
        const n = await consumePendingDhikr();
        if (!cancelled && n > 0) {
          await increment({ date: today, by: n });
        }
      } catch {
        // ignore — bridge may be unavailable
      }
    }
    drain();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        drain();
      }
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [increment, today]);
}

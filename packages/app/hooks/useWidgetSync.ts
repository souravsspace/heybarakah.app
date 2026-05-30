import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useMemo, useRef } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { pickDailyAyah } from "@/lib/daily-ayah";
import { dateKey } from "@/lib/date-utils";
import { buildWidgetSnapshot } from "@/lib/widget-snapshot";
import { setSnapshot } from "@/lib/widgets-native";

const DEBOUNCE_MS = 800;

function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateKey(d);
}

export function useWidgetSync(): void {
  const { prayerTimes } = usePrayerTimes();
  const today = dateKey();
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
      streakBest: streak?.best ?? 0,
      streakHistory: streak?.history ?? [],
      streakTodayDone: streak?.todayDone ?? 0,
      dhikrCount: dhikr?.count ?? 0,
      dhikrTarget: dhikr?.target ?? 33,
      dhikrSessionTotal: dhikr?.sessionTotal ?? 0,
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

    const id = setTimeout(() => {
      setSnapshot(snapshot).catch(() => {
        // Widget bridge is iOS-only and may no-op on other platforms.
      });
    }, DEBOUNCE_MS);
    timer.current = id;

    return () => {
      clearTimeout(id);
    };
  }, [
    ayah,
    dhikr?.count,
    dhikr?.target,
    dhikr?.sessionTotal,
    prayerTimes,
    streak?.days,
    streak?.best,
    streak?.history,
    streak?.todayDone,
    timezone,
    today,
    tomorrow,
  ]);
}

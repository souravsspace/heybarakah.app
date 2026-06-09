import { useQuery as useRqQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useDhikr } from "@/contexts/dhikr-context";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { api } from "@/lib/api-client";
import { pickDailyAyah } from "@/lib/daily-ayah";
import { dateKey } from "@/lib/date-utils";
import { buildWidgetSnapshot } from "@/lib/widget-snapshot";
import { setSnapshot } from "@/lib/widgets-native";

const DEBOUNCE_MS = 800;

interface Streak {
  asOf: string;
  best: number;
  days: number;
  history: number[];
  todayDone: number;
}

function useStreak(today: string): Streak | undefined {
  const query = useRqQuery({
    queryKey: ["cf", "streak", today],
    queryFn: async (): Promise<Streak> => {
      const res = await api.api.v1["prayer-logs"].streak.$get({
        query: { today },
      });
      if (!res.ok) {
        throw new Error("Failed to load streak");
      }
      return await res.json();
    },
  });
  return query.data;
}

function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateKey(d);
}

export function useWidgetSync(): void {
  const { prayerTimes } = usePrayerTimes();
  const today = dateKey();
  const tomorrow = tomorrowKey();

  const streak = useStreak(today);
  // Dhikr mirrors the on-screen tasbih (DhikrProvider, AsyncStorage-backed) so
  // the widget always matches `(tabs)/dhikr.tsx`. The Convex `dhikr.getToday`
  // store is written only by the (currently inert) widget-tap path, so reading
  // it left the widget desynced from what the user actually counts on screen.
  const { active, count, grandTotal } = useDhikr();

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
      dhikrArabic: active.arabic,
      dhikrCount: count,
      dhikrTarget: active.target,
      dhikrSessionTotal: grandTotal,
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
        // Widget bridge is iOS-only and may no-op on other platforms. Clear the
        // dedupe marker so a transient failure doesn't permanently suppress the
        // retry for this snapshot on the next render.
        if (lastJson.current === json) {
          lastJson.current = "";
        }
      });
    }, DEBOUNCE_MS);
    timer.current = id;

    return () => {
      clearTimeout(id);
    };
  }, [
    active.arabic,
    active.target,
    ayah,
    count,
    grandTotal,
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

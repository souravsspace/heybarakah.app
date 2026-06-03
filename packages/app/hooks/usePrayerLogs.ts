import { api } from "@barakah/core/convex/_generated/api";
import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { enqueueMutation } from "@/lib/offline-queue";

/** Mutation kinds replayed by the offline queue (see app/(app)/_layout.tsx). */
export const LOG_PRAYER_KIND = "prayerLogs.logPrayer";
export const CLEAR_PRAYER_KIND = "prayerLogs.clearPrayer";

export interface PrayerLogRow {
  _id: string;
  date: string;
  prayedAt?: number;
  prayer: LoggablePrayerName;
  status: PrayerStatus;
  updatedAt: number;
}

export interface WeekLogs {
  getStatus: (
    date: string,
    prayer: LoggablePrayerName
  ) => PrayerStatus | undefined;
  lateCount: number;
  loading: boolean;
  missedCount: number;
  onTimeCount: number;
  qadaCount: number;
  rows: PrayerLogRow[];
  totalLogged: number;
}

export function useWeekLogs(startDate: string): WeekLogs {
  const data = useQuery(api.lib.prayerLogs.getMyWeek, { startDate });

  return useMemo(() => {
    const rows = (data ?? []) as unknown as PrayerLogRow[];
    const map = new Map<string, PrayerStatus>();
    let onTime = 0;
    let late = 0;
    let qada = 0;
    let missed = 0;
    for (const row of rows) {
      map.set(`${row.date}|${row.prayer}`, row.status);
      if (row.status === "on_time") {
        onTime += 1;
      } else if (row.status === "late") {
        late += 1;
      } else if (row.status === "qada") {
        qada += 1;
      } else {
        missed += 1;
      }
    }
    return {
      rows,
      getStatus: (date, prayer) => map.get(`${date}|${prayer}`),
      onTimeCount: onTime,
      lateCount: late,
      qadaCount: qada,
      missedCount: missed,
      totalLogged: rows.length,
      loading: data === undefined,
    };
  }, [data]);
}

export function useLogPrayer() {
  const mutate = useMutation(api.lib.prayerLogs.logPrayer);
  return useCallback(
    async (args: {
      date: string;
      prayer: LoggablePrayerName;
      status: PrayerStatus;
      prayedAt?: number;
    }) => {
      // Persist a backstop (awaited, so it can't be lost to an app kill before
      // AsyncStorage writes) so the log survives offline; the mutation is
      // idempotent (last write per date+prayer), so a replay is harmless.
      await enqueueMutation(LOG_PRAYER_KIND, args);
      return mutate(args);
    },
    [mutate]
  );
}

export function useClearPrayer() {
  const mutate = useMutation(api.lib.prayerLogs.clearPrayer);
  return useCallback(
    async (args: { date: string; prayer: LoggablePrayerName }) => {
      await enqueueMutation(CLEAR_PRAYER_KIND, args);
      return mutate(args);
    },
    [mutate]
  );
}

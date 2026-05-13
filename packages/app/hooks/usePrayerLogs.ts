import { api } from "@barakah/core/convex/_generated/api";
import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";

export type PrayerLogRow = {
  _id: string;
  date: string;
  prayer: LoggablePrayerName;
  status: PrayerStatus;
  prayedAt?: number;
  updatedAt: number;
};

export type WeekLogs = {
  rows: PrayerLogRow[];
  getStatus: (
    date: string,
    prayer: LoggablePrayerName
  ) => PrayerStatus | undefined;
  onTimeCount: number;
  lateCount: number;
  qadaCount: number;
  missedCount: number;
  totalLogged: number;
  loading: boolean;
};

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
    (args: {
      date: string;
      prayer: LoggablePrayerName;
      status: PrayerStatus;
      prayedAt?: number;
    }) => mutate(args),
    [mutate]
  );
}

export function useClearPrayer() {
  const mutate = useMutation(api.lib.prayerLogs.clearPrayer);
  return useCallback(
    (args: { date: string; prayer: LoggablePrayerName }) => mutate(args),
    [mutate]
  );
}

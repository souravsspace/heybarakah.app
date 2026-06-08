import { api as convexApi } from "@barakah/core/convex/_generated/api";
import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { useQueryClient, useQuery as useRqQuery } from "@tanstack/react-query";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { USE_CF_API } from "@/lib/cf-flag";
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

interface LogPrayerArgs {
  date: string;
  prayedAt?: number;
  prayer: LoggablePrayerName;
  status: PrayerStatus;
}

interface ClearPrayerArgs {
  date: string;
  prayer: LoggablePrayerName;
}

const PRAYER_LOGS_KEY = ["cf", "prayer-logs"] as const;

function toPrayerLogRow(row: {
  id: string;
  date: string;
  prayer: string;
  status: string;
  prayedAt: number | null;
  updatedAt: number;
}): PrayerLogRow {
  return {
    _id: row.id,
    date: row.date,
    prayer: row.prayer as LoggablePrayerName,
    status: row.status as PrayerStatus,
    prayedAt: row.prayedAt ?? undefined,
    updatedAt: row.updatedAt,
  };
}

// `undefined` = still loading (matches the Convex `useQuery` contract).
function useWeekDataConvex(startDate: string): PrayerLogRow[] | undefined {
  const data = useQuery(convexApi.lib.prayerLogs.getMyWeek, { startDate });
  return data as unknown as PrayerLogRow[] | undefined;
}

function useWeekDataCf(startDate: string): PrayerLogRow[] | undefined {
  const query = useRqQuery({
    queryKey: [...PRAYER_LOGS_KEY, "week", startDate],
    queryFn: async (): Promise<PrayerLogRow[]> => {
      const res = await api.api.v1["prayer-logs"].week.$get({
        query: { startDate },
      });
      if (!res.ok) {
        throw new Error("Failed to load prayer logs");
      }
      const data = await res.json();
      return data.map(toPrayerLogRow);
    },
  });
  return query.isPending ? undefined : (query.data ?? []);
}

const useWeekData = USE_CF_API ? useWeekDataCf : useWeekDataConvex;

export function useWeekLogs(startDate: string): WeekLogs {
  const data = useWeekData(startDate);

  return useMemo(() => {
    const rows = data ?? [];
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

function useLogMutateConvex() {
  const mutate = useMutation(convexApi.lib.prayerLogs.logPrayer);
  return useCallback((args: LogPrayerArgs) => mutate(args), [mutate]);
}

function useLogMutateCf() {
  const queryClient = useQueryClient();
  return useCallback(
    async (args: LogPrayerArgs) => {
      const res = await api.api.v1["prayer-logs"].$post({ json: args });
      if (!res.ok) {
        throw new Error("Failed to log prayer");
      }
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: PRAYER_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["cf", "streak"] });
      return data;
    },
    [queryClient]
  );
}

const useLogMutate = USE_CF_API ? useLogMutateCf : useLogMutateConvex;

export function useLogPrayer() {
  const mutate = useLogMutate();
  return useCallback(
    async (args: LogPrayerArgs) => {
      // Persist a backstop (awaited, so it can't be lost to an app kill before
      // AsyncStorage writes) so the log survives offline; the mutation is
      // idempotent (last write per date+prayer), so a replay is harmless.
      await enqueueMutation(
        LOG_PRAYER_KIND,
        args as unknown as Record<string, unknown>
      );
      return mutate(args);
    },
    [mutate]
  );
}

function useClearMutateConvex() {
  const mutate = useMutation(convexApi.lib.prayerLogs.clearPrayer);
  return useCallback((args: ClearPrayerArgs) => mutate(args), [mutate]);
}

function useClearMutateCf() {
  const queryClient = useQueryClient();
  return useCallback(
    async (args: ClearPrayerArgs) => {
      const res = await api.api.v1["prayer-logs"].clear.$post({ json: args });
      if (!res.ok) {
        throw new Error("Failed to clear prayer");
      }
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: PRAYER_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["cf", "streak"] });
      return data;
    },
    [queryClient]
  );
}

const useClearMutate = USE_CF_API ? useClearMutateCf : useClearMutateConvex;

export function useClearPrayer() {
  const mutate = useClearMutate();
  return useCallback(
    async (args: ClearPrayerArgs) => {
      await enqueueMutation(
        CLEAR_PRAYER_KIND,
        args as unknown as Record<string, unknown>
      );
      return mutate(args);
    },
    [mutate]
  );
}

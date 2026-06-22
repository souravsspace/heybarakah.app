import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { useQueryClient, useQuery as useRqQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { captureEvent } from "@/lib/analytics";
import { api } from "@/lib/api-client";
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

// `undefined` = still loading (the contract `useWeekLogs` consumers rely on).
function useWeekData(startDate: string): PrayerLogRow[] | undefined {
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

function useLogMutate() {
  const queryClient = useQueryClient();
  return useCallback(
    async (args: LogPrayerArgs) => {
      // Optimistically upsert the row in every cached week query so the UI
      // flips instantly; snapshot first so a failed POST can roll back.
      // Stop any in-flight week refetch from resolving after our optimistic
      // write and clobbering it with pre-tap server data.
      await queryClient.cancelQueries({ queryKey: PRAYER_LOGS_KEY });
      const snapshot = queryClient.getQueriesData<PrayerLogRow[]>({
        queryKey: PRAYER_LOGS_KEY,
      });
      const optimisticRow: PrayerLogRow = {
        _id: `optimistic-${args.date}-${args.prayer}`,
        date: args.date,
        prayer: args.prayer,
        status: args.status,
        prayedAt: args.prayedAt,
        updatedAt: Date.now(),
      };
      queryClient.setQueriesData<PrayerLogRow[]>(
        { queryKey: PRAYER_LOGS_KEY },
        (prev) => {
          if (prev === undefined) {
            return prev;
          }
          const next = prev.filter(
            (row) => !(row.date === args.date && row.prayer === args.prayer)
          );
          next.push(optimisticRow);
          return next;
        }
      );

      let res: Awaited<ReturnType<(typeof api.api.v1)["prayer-logs"]["$post"]>>;
      try {
        res = await api.api.v1["prayer-logs"].$post({ json: args });
      } catch (err) {
        for (const [key, data] of snapshot) {
          queryClient.setQueryData(key, data);
        }
        throw err;
      }
      if (!res.ok) {
        for (const [key, data] of snapshot) {
          queryClient.setQueryData(key, data);
        }
        throw new Error("Failed to log prayer");
      }
      const data = await res.json();
      captureEvent("prayer logged", {
        prayer: args.prayer,
        status: args.status,
        unlocked: data.unlocked.length,
      });
      queryClient.invalidateQueries({ queryKey: PRAYER_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["cf", "streak"] });
      // The server evaluates achievements inside this write; refresh the unseen
      // query so the popup provider surfaces anything just unlocked.
      if (data.unlocked.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ["cf", "achievements", "unseen"],
        });
      }
      return data;
    },
    [queryClient]
  );
}

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

function useClearMutate() {
  const queryClient = useQueryClient();
  return useCallback(
    async (args: ClearPrayerArgs) => {
      // Optimistically remove the row from every cached week query so the UI
      // clears instantly; snapshot first so a failed POST can roll back.
      // Stop any in-flight week refetch from resolving after our optimistic
      // write and clobbering it with pre-tap server data.
      await queryClient.cancelQueries({ queryKey: PRAYER_LOGS_KEY });
      const snapshot = queryClient.getQueriesData<PrayerLogRow[]>({
        queryKey: PRAYER_LOGS_KEY,
      });
      queryClient.setQueriesData<PrayerLogRow[]>(
        { queryKey: PRAYER_LOGS_KEY },
        (prev) => {
          if (prev === undefined) {
            return prev;
          }
          return prev.filter(
            (row) => !(row.date === args.date && row.prayer === args.prayer)
          );
        }
      );

      let res: Awaited<
        ReturnType<(typeof api.api.v1)["prayer-logs"]["clear"]["$post"]>
      >;
      try {
        res = await api.api.v1["prayer-logs"].clear.$post({ json: args });
      } catch (err) {
        for (const [key, data] of snapshot) {
          queryClient.setQueryData(key, data);
        }
        throw err;
      }
      if (!res.ok) {
        for (const [key, data] of snapshot) {
          queryClient.setQueryData(key, data);
        }
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

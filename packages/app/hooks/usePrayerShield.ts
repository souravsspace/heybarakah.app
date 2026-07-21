import type { PrayerWindow } from "@barakah/core/shieldSelection";
import { useQuery as useRqQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useTodayKey } from "@/hooks/use-today-key";
import { api } from "@/lib/api-client";
import {
  clearAllBlocks,
  clearScheduledWindows,
  getBlockConfiguration,
  isTemporarilyUnlocked,
  liftShieldNow,
  relockApps,
  scheduleBlockWindows,
  setBlockedApps,
  startMonitoring,
  stopMonitoring,
  temporaryUnlock,
} from "@/lib/app-blocker";
import {
  cancelShieldNotifications,
  scheduleShieldNotifications,
} from "@/lib/prayer-shield-notifications";
import {
  clearShieldSchedule,
  persistShieldSchedule,
  registerPrayerShieldTask,
} from "@/lib/prayer-shield-task";
import {
  computeWindows,
  type Timings,
  toBlockWindows,
} from "@/lib/prayer-shield-windows";
import {
  cacheShieldSelection,
  loadCachedShieldSelection,
} from "@/lib/shield-selection-offline";
import { useWeekLogs } from "./usePrayerLogs";
import { usePrayerTimes } from "./usePrayerTimes";

const INACTIVE_STATE = /inactive|background/;

interface ShieldRow {
  androidPackageNames: string[] | null;
  enabled: boolean;
  iosItemCount: number | null;
  iosSelectionData: string | null;
  windows: PrayerWindow[];
}

// `undefined` = loading, `null` = no selection (the contract this hook relies on).
type ShieldSelection = ShieldRow | null | undefined;

function useShieldSelection(): ShieldSelection {
  const query = useRqQuery({
    queryKey: ["cf", "shield"],
    queryFn: async (): Promise<ShieldRow | null> => {
      const res = await api.api.v1.shield.$get();
      if (!res.ok) {
        throw new Error("Failed to load shield selection");
      }
      return (await res.json()) as ShieldRow | null;
    },
  });
  return query.isPending ? undefined : (query.data ?? null);
}

export function usePrayerShield() {
  const liveSelection = useShieldSelection();
  const [cachedSelection, setCachedSelection] =
    useState<NonNullable<ShieldSelection> | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  // `undefined` = still loading → fall back to the last cached server value so
  // the shield can re-schedule after a cold start while offline. A loaded
  // `null` means there genuinely is no selection, so don't use the stale cache.
  const selection =
    liveSelection === undefined
      ? (cachedSelection ?? undefined)
      : (liveSelection ?? undefined);
  // Still resolving both sources — acting now would clear a live schedule before
  // we know the real selection, so callers must wait.
  const resolving = liveSelection === undefined && !cacheLoaded;
  const { todayPrayerTimes } = usePrayerTimes();
  const today = useTodayKey();
  const week = useWeekLogs(today);
  const weekRef = useRef(week);
  weekRef.current = week;
  // Changes whenever a prayer is logged/cleared today, so `sync` re-runs and
  // lifts the shield the moment the current window's prayer is marked prayed.
  const loggedKey = week.rows
    .filter((row) => row.date === today)
    .map((row) => row.prayer)
    .sort()
    .join(",");
  const appStateRef = useRef(AppState.currentState);
  const lastScheduleKey = useRef<string>("");
  const [activeWindow, setActiveWindow] = useState<PrayerWindow | null>(null);

  useEffect(() => {
    loadCachedShieldSelection<NonNullable<ShieldSelection>>()
      .then(setCachedSelection)
      .catch(() => null)
      .finally(() => setCacheLoaded(true));
  }, []);

  useEffect(() => {
    if (liveSelection) {
      cacheShieldSelection(liveSelection).catch(() => null);
    }
  }, [liveSelection]);

  const sync = useCallback(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      setActiveWindow(null);
      return;
    }
    // Don't touch the shield until we actually know the selection — clearing it
    // mid-load would wipe an active schedule on every cold start.
    if (resolving) {
      return;
    }
    if (!selection?.enabled || selection.windows.length === 0) {
      setActiveWindow(null);
      try {
        clearAllBlocks();
        if (Platform.OS === "ios") {
          clearScheduledWindows();
        }
        if (Platform.OS === "android") {
          stopMonitoring();
        }
      } catch {
        // noop — library may throw on simulator or pre-permission
      }
      cancelShieldNotifications().catch(() => null);
      clearShieldSchedule().catch(() => null);
      lastScheduleKey.current = "";
      return;
    }
    if (!todayPrayerTimes) {
      setActiveWindow(null);
      return;
    }

    const times = todayPrayerTimes.timings as Timings;
    const windows = computeWindows(selection.windows, times);
    if (windows.length === 0) {
      setActiveWindow(null);
      return;
    }

    // Re-scheduling cancels + re-issues every notification id and re-registers
    // the OS DeviceActivity windows. Skip it unless the windows/times actually
    // changed, so the 30s active-app tick doesn't churn the iOS quota. The iOS
    // token count is part of the key so picking apps when none were selected
    // before (windows unchanged) still triggers the DeviceActivity registration.
    const iosItemCount =
      Platform.OS === "ios"
        ? (getBlockConfiguration()?.blockedItems?.length ?? 0)
        : 0;
    const scheduleKey = JSON.stringify({
      iosItemCount,
      times,
      windows: selection.windows,
    });
    if (scheduleKey !== lastScheduleKey.current) {
      lastScheduleKey.current = scheduleKey;
      scheduleShieldNotifications({
        windows: selection.windows,
        times,
      }).catch(() => null);
      persistShieldSchedule({ windows: selection.windows, times }).catch(
        () => null
      );
      // iOS: hand the windows to DeviceActivity so the shield engages/lifts at
      // each salah even when the app is closed (the foreground tick alone can't
      // flip the shield in the background). Tokens were already stored by the
      // picker via setBlockConfiguration; we only manage the schedule here.
      if (Platform.OS === "ios") {
        if (iosItemCount > 0) {
          scheduleBlockWindows(toBlockWindows(windows));
        } else {
          // User cleared all blocked apps: tear down the stale OS schedule so a
          // later re-add isn't shadowed by a leftover DeviceActivity interval.
          clearScheduledWindows();
        }
      }
    }

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const inside = windows.find((w) => nowMin >= w.start && nowMin < w.end);
    // A window whose prayer is already logged today is not "active": the shield
    // and the unlock-screen auto-push (driven off activeWindow) both stand down.
    const insideLogged = inside
      ? Boolean(weekRef.current.getStatus(today, inside.name))
      : false;
    const effective = inside && !insideLogged ? inside : null;
    setActiveWindow(effective ? effective.name : null);

    // iOS shield engages at the DeviceActivity interval start regardless of log
    // state, so once the current window's prayer is logged we must actively lift
    // it for the rest of the window. temporaryUnlock holds until the window end,
    // when DeviceActivity unshields anyway; the guard stops the 30s tick respamming.
    if (
      Platform.OS === "ios" &&
      inside &&
      insideLogged &&
      !isTemporarilyUnlocked()
    ) {
      temporaryUnlock(Math.max(1, inside.end - nowMin)).catch(() => null);
    }

    // iOS foreground backstop, symmetric around the window edges. The
    // DeviceActivity extension covers the app-closed case, but registering a
    // schedule mid-interval doesn't reliably fire `intervalDidStart`/`intervalDidEnd`.
    // While Barakah is foreground we drive the shield directly so it both
    // engages at salah and *lifts when the window ends* — without the lift the
    // shield applied via relockApps stayed on past the 15-minute window if the
    // extension's intervalDidEnd was delayed or dropped (apps stuck locked).
    if (Platform.OS === "ios" && !isTemporarilyUnlocked()) {
      if (effective) {
        // Inside an unlogged window → re-assert the persisted token set
        // (idempotent, so the 30s tick can re-apply harmlessly).
        relockApps().catch(() => null);
      } else if (!inside) {
        // Outside every window (or the window just ended) → release the shield
        // the native module may have eagerly applied on launch/resume.
        liftShieldNow();
      }
    }

    // Android has no equivalent OS scheduler, so keep driving its foreground
    // service from the effective (not-yet-prayed) window state.
    if (Platform.OS === "android") {
      const packages = selection.androidPackageNames ?? [];
      if (packages.length === 0) {
        return;
      }
      if (effective) {
        setBlockedApps(packages);
        startMonitoring();
      } else {
        setBlockedApps([]);
        stopMonitoring();
      }
    }
  }, [resolving, selection, todayPrayerTimes, loggedKey, today]);

  useEffect(() => {
    registerPrayerShieldTask().catch(() => null);
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (INACTIVE_STATE.test(appStateRef.current) && state === "active") {
        sync();
      }
      appStateRef.current = state;
    });
    return () => sub.remove();
  }, [sync]);

  useEffect(() => {
    const id = setInterval(() => {
      if (AppState.currentState === "active") {
        sync();
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [sync]);

  return { activeWindow };
}

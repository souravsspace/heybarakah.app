import { api } from "@barakah/core/convex/_generated/api";
import type { PrayerWindow } from "@barakah/core/shieldSelection";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import {
  clearAllBlocks,
  clearScheduledWindows,
  getBlockConfiguration,
  type PrayerBlockWindow,
  scheduleBlockWindows,
  setBlockedApps,
  startMonitoring,
  stopMonitoring,
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
import { lockBoundsMinutes } from "@/lib/prayer-window-config";
import { usePrayerTimes } from "./usePrayerTimes";

interface Timings {
  asr: string;
  dhuhr: string;
  fajr: string;
  isha: string;
  maghrib: string;
}

const INACTIVE_STATE = /inactive|background/;

function parseHHmm(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return h * 60 + m;
}

function toBlockWindows(
  windows: { name: PrayerWindow; start: number; end: number }[]
): PrayerBlockWindow[] {
  return windows.map((w) => {
    // DateComponents has no hour 24; clamp a midnight end to 23:59.
    const end = Math.min(w.end, 1439);
    return {
      endHour: Math.floor(end / 60),
      endMinute: end % 60,
      name: w.name,
      startHour: Math.floor(w.start / 60),
      startMinute: w.start % 60,
    };
  });
}

function computeWindows(windows: PrayerWindow[], timings: Timings) {
  const out: { name: PrayerWindow; start: number; end: number }[] = [];
  for (const name of windows) {
    const adhan = parseHHmm(timings[name]);
    if (adhan === null) {
      continue;
    }
    const { start, end } = lockBoundsMinutes(name, adhan);
    if (start >= 1440) {
      continue;
    }
    out.push({ name, start, end: Math.min(end, 1440) });
  }
  return out.sort((a, b) => a.start - b.start);
}

export function usePrayerShield() {
  const selection = useQuery(api.lib.shieldSelection.getMine);
  const { todayPrayerTimes } = usePrayerTimes();
  const appStateRef = useRef(AppState.currentState);
  const lastScheduleKey = useRef<string>("");
  const [activeWindow, setActiveWindow] = useState<PrayerWindow | null>(null);

  const sync = useCallback(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      setActiveWindow(null);
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
    // changed, so the 30s active-app tick doesn't churn the iOS quota.
    const scheduleKey = JSON.stringify({ windows: selection.windows, times });
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
        const items = getBlockConfiguration()?.blockedItems ?? [];
        if (items.length > 0) {
          scheduleBlockWindows(toBlockWindows(windows));
        }
      }
    }

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const inside = windows.find((w) => nowMin >= w.start && nowMin < w.end);
    setActiveWindow(inside ? inside.name : null);

    // iOS shield activation is driven entirely by the DeviceActivity schedule
    // above; nothing to toggle per-tick. Android has no equivalent OS scheduler,
    // so keep driving its foreground service from the window state.
    if (Platform.OS === "android") {
      const packages = selection.androidPackageNames ?? [];
      if (packages.length === 0) {
        return;
      }
      if (inside) {
        setBlockedApps(packages);
        startMonitoring();
      } else {
        setBlockedApps([]);
        stopMonitoring();
      }
    }
  }, [selection, todayPrayerTimes]);

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

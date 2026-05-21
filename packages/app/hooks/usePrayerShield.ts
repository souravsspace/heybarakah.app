import { api } from "@barakah/core/convex/_generated/api";
import type { PrayerWindow } from "@barakah/core/shieldSelection";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import {
  clearAllBlocks,
  getBlockConfiguration,
  isTemporarilyUnlocked,
  relockApps,
  setBlockConfiguration,
  setBlockedApps,
  startMonitoring,
  stopMonitoring,
  temporaryUnlock,
} from "@/lib/app-blocker";
import {
  cancelShieldNotifications,
  scheduleShieldNotifications,
} from "@/lib/prayer-shield-notifications";
import { registerPrayerShieldTask } from "@/lib/prayer-shield-task";
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
        if (Platform.OS === "android") {
          stopMonitoring();
        }
      } catch {
        // noop — library may throw on simulator or pre-permission
      }
      cancelShieldNotifications().catch(() => null);
      return;
    }
    if (!todayPrayerTimes) {
      return;
    }

    scheduleShieldNotifications({
      windows: selection.windows,
      times: todayPrayerTimes.timings as Timings,
    }).catch(() => null);

    const windows = computeWindows(
      selection.windows,
      todayPrayerTimes.timings as Timings
    );
    if (windows.length === 0) {
      return;
    }

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const inside = windows.find((w) => nowMin >= w.start && nowMin < w.end);
    setActiveWindow(inside ? inside.name : null);

    if (Platform.OS === "ios") {
      const cfg = getBlockConfiguration();
      const items = cfg?.blockedItems ?? [];
      if (items.length === 0) {
        return;
      }
      if (inside) {
        if (isTemporarilyUnlocked()) {
          relockApps();
        }
        setBlockConfiguration({ blockedItems: items, isActive: true });
        return;
      }
      const future = windows.filter((w) => w.start > nowMin);
      const nextStart = future.length > 0 ? future[0].start : null;
      const unlockMinutes =
        nextStart === null
          ? 24 * 60 - nowMin
          : Math.max(1, nextStart - nowMin - 1);
      setBlockConfiguration({ blockedItems: items, isActive: true });
      temporaryUnlock(unlockMinutes);
      return;
    }

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

  return { activeWindow };
}

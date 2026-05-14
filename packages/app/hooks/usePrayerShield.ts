import { api } from "@barakah/core/convex/_generated/api";
import type { PrayerWindow } from "@barakah/core/shieldSelection";
import { useQuery } from "convex/react";
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
} from "expo-app-blocker";
import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { usePrayerTimes } from "./usePrayerTimes";

const WINDOW_DURATION_MIN = 20;

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
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return null;
  }
  return h * 60 + m;
}

function computeWindows(windows: PrayerWindow[], timings: Timings) {
  const out: { name: PrayerWindow; start: number; end: number }[] = [];
  for (const name of windows) {
    const start = parseHHmm(timings[name]);
    if (start === null) {
      continue;
    }
    out.push({ name, start, end: start + WINDOW_DURATION_MIN });
  }
  return out.sort((a, b) => a.start - b.start);
}

export function usePrayerShield() {
  const selection = useQuery(api.lib.shieldSelection.getMine);
  const { todayPrayerTimes } = usePrayerTimes();
  const appStateRef = useRef(AppState.currentState);

  const sync = useCallback(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }
    if (!selection?.enabled || selection.windows.length === 0) {
      try {
        clearAllBlocks();
        if (Platform.OS === "android") {
          stopMonitoring();
        }
      } catch {
        // noop — library may throw on simulator or pre-permission
      }
      return;
    }
    if (!todayPrayerTimes) {
      return;
    }

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
}

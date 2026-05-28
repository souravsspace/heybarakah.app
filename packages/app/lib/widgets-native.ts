import {
  type NativeModule,
  requireOptionalNativeModule,
} from "expo-modules-core";
import { Platform } from "react-native";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface WidgetPrayerEntry {
  adhanISO: string;
  endISO: string;
  name: PrayerName;
  startISO: string;
}

export interface WidgetSnapshot {
  ayah: {
    arabic: string;
    reference: string;
    surah: string;
    translation: string;
  };
  date: string;
  dhikr: { count: number; sessionTotal: number; target: number };
  generatedAt: string;
  lockNow: { name: PrayerName; endISO: string } | null;
  prayers: WidgetPrayerEntry[];
  streak: { best: number; days: number; history: number[]; todayDone: number };
  tomorrowFajrISO: string | null;
  tz: string;
  v: 1;
}

interface ExpoWidgetsNative extends NativeModule {
  ackPendingDhikr(count: number): Promise<void>;
  endAllLockActivities(): Promise<void>;
  endLockActivity(id: string): Promise<void>;
  peekPendingDhikr(): Promise<number>;
  reloadTimelines(): Promise<void>;
  setSnapshot(json: string): Promise<void>;
  startLockActivity(
    name: string,
    startISO: string,
    endISO: string
  ): Promise<string>;
}

const native: ExpoWidgetsNative | null =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<ExpoWidgetsNative>("ExpoWidgets")
    : null;

export async function setSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (!native) {
    return;
  }
  await native.setSnapshot(JSON.stringify(snapshot));
}

export function reloadTimelines(): Promise<void> {
  if (!native) {
    return Promise.resolve();
  }
  return native.reloadTimelines();
}

export function peekPendingDhikr(): Promise<number> {
  if (!native) {
    return Promise.resolve(0);
  }
  return native.peekPendingDhikr();
}

export function ackPendingDhikr(count: number): Promise<void> {
  if (!native) {
    return Promise.resolve();
  }
  return native.ackPendingDhikr(count);
}

export function startLockActivity(args: {
  name: string;
  startISO: string;
  endISO: string;
}): Promise<string> {
  if (!native) {
    return Promise.reject(new Error("ExpoWidgets: iOS only"));
  }
  return native.startLockActivity(args.name, args.startISO, args.endISO);
}

export function endLockActivity(id: string): Promise<void> {
  if (!native) {
    return Promise.resolve();
  }
  return native.endLockActivity(id);
}

export function endAllLockActivities(): Promise<void> {
  if (!native) {
    return Promise.resolve();
  }
  return native.endAllLockActivities();
}

import {
  type NativeModule,
  requireOptionalNativeModule,
} from "expo-modules-core";
import { Platform } from "react-native";
import type { WidgetSnapshot } from "./types";

interface WidgetBridgeNative extends NativeModule {
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

const native: WidgetBridgeNative | null =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<WidgetBridgeNative>("WidgetBridge")
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
    return Promise.reject(new Error("WidgetBridge: iOS only"));
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

export type {
  PrayerName,
  WidgetPrayerEntry,
  WidgetSnapshot,
} from "./types";

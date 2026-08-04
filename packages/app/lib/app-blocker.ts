import type {
  AndroidBlockableApp,
  BlockedAppsNativeListProps,
  BlockedItemRemoveEvent,
  FamilyActivityPickerViewProps,
  IOSBlockConfiguration,
  IOSPickerResultItem,
  PermissionStatus,
  PrayerBlockWindow,
  RelockResult,
  RemoveBlockedItemResult,
  TemporaryUnlockResult,
} from "expo-app-blocker";
import React from "react";
import { Platform } from "react-native";

export type {
  AndroidBlockableApp,
  BlockedAppsNativeListProps,
  BlockedItemRemoveEvent,
  FamilyActivityPickerSelectionEvent,
  FamilyActivityPickerViewProps,
  IOSBlockConfiguration,
  IOSBlockedItem,
  IOSPickerResultItem,
  IOSPickerSummary,
  PermissionStatus,
  PrayerBlockWindow,
  RelockResult,
  RemoveBlockedItemResult,
  TemporaryUnlockResult,
} from "expo-app-blocker";

type Mod = typeof import("expo-app-blocker");

let mod: Mod | null = null;
try {
  mod = require("expo-app-blocker") as Mod;
} catch {
  mod = null;
}

export const isAppBlockerAvailable = mod !== null;

const STUB_PERMISSION: PermissionStatus = {
  allGranted: false,
  details: {
    platform: Platform.OS === "android" ? "android" : "ios",
    authorized: false,
    status: "notDetermined",
  } as PermissionStatus["details"],
};

export function getPermissionStatus(): Promise<PermissionStatus> {
  if (!mod) {
    return Promise.resolve(STUB_PERMISSION);
  }
  return mod.getPermissionStatus();
}

export function requestPermissions(): Promise<PermissionStatus> {
  if (!mod) {
    return Promise.resolve(STUB_PERMISSION);
  }
  return mod.requestPermissions();
}

export function getInstalledApps(): Promise<AndroidBlockableApp[]> {
  if (!mod) {
    return Promise.resolve([]);
  }
  return mod.getInstalledApps();
}

export function setBlockedApps(packageNames: string[]): void {
  if (!mod) {
    return;
  }
  mod.setBlockedApps(packageNames);
}

export function startMonitoring(): void {
  if (!mod) {
    return;
  }
  mod.startMonitoring();
}

export function stopMonitoring(): void {
  if (!mod) {
    return;
  }
  mod.stopMonitoring();
}

export function setBlockConfiguration(
  config: IOSBlockConfiguration
): Promise<void> {
  if (!mod) {
    return Promise.resolve();
  }
  return mod.setBlockConfiguration(config);
}

export function getBlockConfiguration(): IOSBlockConfiguration | null {
  if (!mod) {
    return null;
  }
  return mod.getBlockConfiguration();
}

export function clearAllBlocks(): void {
  if (!mod) {
    return;
  }
  mod.clearAllBlocks();
}

export function scheduleBlockWindows(windows: PrayerBlockWindow[]): void {
  if (!mod) {
    return;
  }
  mod.scheduleBlockWindows(windows);
}

export function clearScheduledWindows(): void {
  if (!mod) {
    return;
  }
  mod.clearScheduledWindows();
}

export function scheduleTestWindow(
  startInSeconds = 90,
  durationMinutes = 16
): void {
  if (!mod) {
    return;
  }
  mod.scheduleTestWindow(startInSeconds, durationMinutes);
}

export function dumpDiagnostics(): void {
  if (!mod) {
    return;
  }
  mod.dumpDiagnostics();
}

export function removeBlockedItem(
  tokenId: string,
  type: BlockedItemRemoveEvent["type"]
): Promise<RemoveBlockedItemResult> {
  if (!mod) {
    return Promise.resolve({ removed: false, remaining: 0 });
  }
  return mod.removeBlockedItem(tokenId, type);
}

export function temporaryUnlock(
  durationMinutes = 15
): Promise<TemporaryUnlockResult> {
  if (!mod) {
    return Promise.resolve({ unlocked: false, expiresAt: 0 });
  }
  return mod.temporaryUnlock(durationMinutes);
}

export function isTemporarilyUnlocked(): boolean {
  if (!mod) {
    return false;
  }
  return mod.isTemporarilyUnlocked();
}

export function relockApps(): Promise<RelockResult> {
  if (!mod) {
    return Promise.resolve({ locked: false });
  }
  return mod.relockApps();
}

export function liftShieldNow(): void {
  if (!mod) {
    return;
  }
  mod.liftShieldNow();
}

export function checkAndClearPendingUnlock(): boolean {
  if (!mod) {
    return false;
  }
  return mod.checkAndClearPendingUnlock();
}

export function addPendingUnlockListener(
  handler: () => void
): { remove: () => void } | null {
  if (!mod) {
    return null;
  }
  return mod.addPendingUnlockListener(handler);
}

export function BlockedAppsNativeList(
  props: BlockedAppsNativeListProps
): React.ReactElement | null {
  if (!mod) {
    return null;
  }
  return React.createElement(mod.BlockedAppsNativeList, props);
}

export function FamilyActivityPickerView(
  props: FamilyActivityPickerViewProps
): React.ReactElement | null {
  if (!mod) {
    return null;
  }
  return React.createElement(mod.FamilyActivityPickerView, props);
}

export function presentFamilyActivityPicker(): Promise<IOSPickerResultItem[]> {
  if (!mod) {
    return Promise.resolve([]);
  }
  return mod.presentFamilyActivityPicker();
}

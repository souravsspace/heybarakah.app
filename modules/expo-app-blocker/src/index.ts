import {
  EventEmitter,
  requireNativeModule,
  requireNativeViewManager,
} from "expo-modules-core";
import React from "react";
import { Platform } from "react-native";

import type {
  AndroidBlockableApp,
  AndroidConfig,
  AndroidPermissions,
  BlockedAppsNativeListProps,
  FamilyActivityPickerViewProps,
  IOSBlockConfiguration,
  IOSBlockedItem,
  IOSPermissions,
  IOSPickerResultItem,
  PermissionStatus,
  PrayerBlockWindow,
  RelockResult,
  RemoveBlockedItemResult,
  TemporaryUnlockResult,
} from "./ExpoAppBlocker.types";

export type {
  AndroidBlockableApp,
  AndroidConfig,
  AndroidPermissions,
  BlockedAppsNativeListProps,
  BlockedItemRemoveEvent,
  FamilyActivityPickerSelectionEvent,
  FamilyActivityPickerViewProps,
  IOSBlockConfiguration,
  IOSBlockedItem,
  IOSPermissions,
  IOSPickerResultItem,
  IOSPickerSummary,
  PermissionStatus,
  PluginConfig,
  PrayerBlockWindow,
  RelockResult,
  RemoveBlockedItemResult,
  ShieldConfig,
  TemporaryUnlockResult,
} from "./ExpoAppBlocker.types";

// ──────────────────────────────────────────────────────────────────────────────
// Native module bridge
// ──────────────────────────────────────────────────────────────────────────────

const NativeModule = requireNativeModule("ExpoAppBlocker");

// ──────────────────────────────────────────────────────────────────────────────
// Permissions
// ──────────────────────────────────────────────────────────────────────────────

export async function getPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === "android") {
    const overlay = await NativeModule.checkOverlayPermission();
    const usageStats = await NativeModule.checkUsageStatsPermission();
    const notifications = await NativeModule.checkNotificationPermission();
    const details: AndroidPermissions = {
      platform: "android",
      overlay,
      usageStats,
      notifications,
    };
    return { allGranted: overlay && usageStats && notifications, details };
  }

  if (Platform.OS === "ios") {
    const result = NativeModule.getAuthorizationStatus();
    const details: IOSPermissions = {
      platform: "ios",
      authorized: result.authorized,
      status: result.status,
    };
    return { allGranted: result.authorized, details };
  }

  throw new Error("Unsupported platform");
}

export async function requestPermissions(): Promise<PermissionStatus> {
  if (Platform.OS === "ios") {
    const result = await NativeModule.requestAuthorization();
    const details: IOSPermissions = {
      platform: "ios",
      authorized: result.authorized,
      status: result.status,
    };
    return { allGranted: result.authorized, details };
  }
  return getPermissionStatus();
}

// ──────────────────────────────────────────────────────────────────────────────
// Android-specific: permission settings
// ──────────────────────────────────────────────────────────────────────────────

export function openOverlaySettings(): void {
  if (Platform.OS !== "android") {
    return;
  }
  NativeModule.openOverlaySettings();
}

export function openUsageStatsSettings(): void {
  if (Platform.OS !== "android") {
    return;
  }
  NativeModule.openUsageStatsSettings();
}

// ──────────────────────────────────────────────────────────────────────────────
// Android-specific: app list and blocking
// ──────────────────────────────────────────────────────────────────────────────

export async function getInstalledApps(): Promise<AndroidBlockableApp[]> {
  if (Platform.OS !== "android") {
    return [];
  }
  return NativeModule.getInstalledApps();
}

export function setBlockedApps(packageNames: string[]): void {
  if (Platform.OS !== "android") {
    return;
  }
  NativeModule.setBlockedApps(packageNames);
}

export function getBlockedApps(): string[] {
  if (Platform.OS !== "android") {
    return [];
  }
  return NativeModule.getBlockedApps();
}

export function configureAndroid(config: AndroidConfig): void {
  if (Platform.OS !== "android") {
    return;
  }
  NativeModule.setAndroidConfig(config);
}

export function startMonitoring(): void {
  if (Platform.OS !== "android") {
    return;
  }
  NativeModule.startMonitoring();
}

export function stopMonitoring(): void {
  if (Platform.OS !== "android") {
    return;
  }
  NativeModule.stopMonitoring();
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS-specific: Family Controls
// ──────────────────────────────────────────────────────────────────────────────

export async function presentFamilyActivityPicker(): Promise<
  IOSPickerResultItem[]
> {
  if (Platform.OS !== "ios") {
    throw new Error("Family Activity Picker is only available on iOS");
  }
  // The native result is the real blocked items followed by a trailing
  // `{ type: "summary" }` metadata row — model it so callers strip it.
  return NativeModule.presentFamilyActivityPicker();
}

export async function setBlockConfiguration(
  config: IOSBlockConfiguration
): Promise<void> {
  if (Platform.OS !== "ios") {
    throw new Error("Block configuration is only available on iOS");
  }
  return NativeModule.setBlockConfiguration(config);
}

export function getBlockConfiguration(): IOSBlockConfiguration | null {
  if (Platform.OS !== "ios") {
    return null;
  }
  return NativeModule.getBlockConfiguration();
}

export function clearAllBlocks(): void {
  if (Platform.OS !== "ios") {
    return;
  }
  NativeModule.clearAllBlocks();
}

/**
 * Schedules daily-recurring DeviceActivity windows so the shield engages and
 * lifts automatically at each prayer time — even when the app is closed. Call
 * `setBlockConfiguration` first to store the tokens; this only manages the
 * schedule. Outside every window the shield is cleared so apps stay usable.
 */
export function scheduleBlockWindows(windows: PrayerBlockWindow[]): void {
  if (Platform.OS !== "ios") {
    return;
  }
  NativeModule.scheduleBlockWindows(windows);
}

/**
 * DEV harness: schedules a single real DeviceActivity window `startInSeconds`
 * from now for `durationMinutes`, exercising the exact native salah path
 * (`intervalDidStart` in the monitor extension) on demand. Background the app
 * after calling this and watch Console.app / `idevicesyslog` for the
 * "[BarakahShield]" breadcrumbs. Select blocked apps first so the shield has
 * something to apply. No-op off iOS.
 */
export function scheduleTestWindow(
  startInSeconds = 90,
  durationMinutes = 16
): void {
  if (Platform.OS !== "ios") {
    return;
  }
  NativeModule.scheduleTestWindow(startInSeconds, durationMinutes);
}

/**
 * DEV harness: dumps the registered DeviceActivity activities, the windows
 * persisted for the monitor extension, and the stored token count to the
 * unified log under "[BarakahShield]". Use it after a salah that failed to
 * shield to see whether the windows were registered at all. No-op off iOS.
 */
export function dumpDiagnostics(): void {
  if (Platform.OS !== "ios") {
    return;
  }
  NativeModule.dumpDiagnostics();
}

/** Stops all prayer-window monitoring and clears the shield (keeps the stored
 *  token configuration so windows can be re-scheduled later). */
export function clearScheduledWindows(): void {
  if (Platform.OS !== "ios") {
    return;
  }
  NativeModule.clearScheduledWindows();
}

export async function removeBlockedItem(
  tokenId: string,
  type: "app" | "category" | "webDomain"
): Promise<RemoveBlockedItemResult> {
  if (Platform.OS !== "ios") {
    return { removed: false, remaining: 0 };
  }
  return NativeModule.removeBlockedItem(tokenId, type);
}

export function isAppBlocked(bundleIdentifier: string): boolean {
  if (Platform.OS !== "ios") {
    return false;
  }
  return NativeModule.isAppBlocked(bundleIdentifier);
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS-specific: Temporary unlock
// ──────────────────────────────────────────────────────────────────────────────

export async function temporaryUnlock(
  durationMinutes = 15
): Promise<TemporaryUnlockResult> {
  if (Platform.OS !== "ios") {
    throw new Error("Temporary unlock is only available on iOS");
  }
  return NativeModule.temporaryUnlock(durationMinutes);
}

export function isTemporarilyUnlocked(): boolean {
  if (Platform.OS !== "ios") {
    return false;
  }
  return NativeModule.isTemporarilyUnlocked();
}

export function getRemainingUnlockTime(): number {
  if (Platform.OS !== "ios") {
    return 0;
  }
  return NativeModule.getRemainingUnlockTime();
}

export async function relockApps(): Promise<RelockResult> {
  if (Platform.OS !== "ios") {
    throw new Error("Relock is only available on iOS");
  }
  return NativeModule.relockApps();
}

/**
 * Lift the active shield without discarding the persisted selection or the
 * temporary-unlock state. Used by the foreground scheduler to release blocked
 * apps the moment a prayer window ends, independent of the DeviceActivity
 * extension's interval callbacks.
 */
export function liftShieldNow(): void {
  if (Platform.OS !== "ios") {
    return;
  }
  NativeModule.liftShieldNow();
}

export function checkAndClearPendingUnlock(): boolean {
  if (Platform.OS !== "ios") {
    return false;
  }
  return NativeModule.checkAndClearPendingUnlock();
}

export function addPendingUnlockListener(
  handler: () => void
): { remove: () => void } | null {
  if (Platform.OS !== "ios") {
    return null;
  }
  const emitter = new EventEmitter(NativeModule) as unknown as {
    addListener: (
      event: string,
      listener: () => void
    ) => { remove: () => void };
  };
  return emitter.addListener("onPendingUnlockRequest", handler);
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS Native View: renders blocked app tokens with real names and icons
// ──────────────────────────────────────────────────────────────────────────────

let NativeBlockedAppsView: any = null;
if (Platform.OS === "ios") {
  try {
    NativeBlockedAppsView = requireNativeViewManager("ExpoAppBlocker");
  } catch {}
}

export function BlockedAppsNativeList({
  items,
  theme,
  style,
  onRequestRemove,
}: BlockedAppsNativeListProps) {
  if (!NativeBlockedAppsView || Platform.OS !== "ios") {
    return null;
  }

  // `tokens` is the canonical source for the native view; the legacy
  // `selectionData` prop is a no-op on the native side so we no longer forward
  // it over the bridge on every render.
  const tokens = items
    .filter((item) => (item.type as string) !== "summary")
    .map((item) => ({
      token: item.token,
      type: item.type,
      displayName: item.displayName ?? item.categoryName ?? item.domain ?? "",
    }));

  return React.createElement(NativeBlockedAppsView, {
    tokens,
    theme: theme || "light",
    onRequestRemove,
    style: [{ minHeight: 50 }, style],
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS Native View: inline FamilyActivityPicker (embedded in your UI)
// ──────────────────────────────────────────────────────────────────────────────

let NativePickerView: any = null;
if (Platform.OS === "ios") {
  try {
    NativePickerView = requireNativeViewManager("ExpoAppBlockerPicker");
  } catch {}
}

export function FamilyActivityPickerView({
  initialSelection,
  onSelectionChange,
  theme,
  style,
  clearTrigger,
}: FamilyActivityPickerViewProps) {
  if (!NativePickerView || Platform.OS !== "ios") {
    return null;
  }

  return React.createElement(NativePickerView, {
    initialSelection: initialSelection || "",
    theme: theme || "system",
    onSelectionChange: onSelectionChange
      ? (e: any) => {
          const ne = e.nativeEvent;
          const items = (ne.items ?? []).filter(
            (item: { type?: string }) =>
              item?.type === "app" ||
              item?.type === "category" ||
              item?.type === "webDomain"
          );
          onSelectionChange({ ...ne, items });
        }
      : undefined,
    ...(clearTrigger === undefined ? {} : { clearTrigger }),
    style: [{ minHeight: 400 }, style],
  });
}

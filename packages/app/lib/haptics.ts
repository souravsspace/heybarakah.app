import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

// Single source of truth for haptics. Every call site in the app routes through
// the wrappers below, so the "Haptic feedback" toggle in Preferences silences
// or enables haptics everywhere. The flag is kept in a module-level variable so
// non-React call sites can read it synchronously; it is hydrated from storage
// on first import and updated by setHapticsEnabled.
const STORAGE_KEY = "@barakah/pref/haptics";

let enabled = true;

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw === "0") {
      enabled = false;
    } else if (raw === "1") {
      enabled = true;
    }
  })
  .catch(() => undefined);

export function getHapticsEnabled(): boolean {
  return enabled;
}

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
  AsyncStorage.setItem(STORAGE_KEY, value ? "1" : "0").catch(() => undefined);
}

export function hapticSelection(): void {
  if (!enabled) {
    return;
  }
  Haptics.selectionAsync().catch(() => undefined);
}

type ImpactWeight = "light" | "medium" | "heavy";

export function hapticImpact(weight: ImpactWeight = "light"): void {
  if (!enabled) {
    return;
  }
  const style =
    weight === "heavy"
      ? Haptics.ImpactFeedbackStyle.Heavy
      : weight === "medium"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
  Haptics.impactAsync(style).catch(() => undefined);
}

type NotifyKind = "success" | "warning" | "error";

export function hapticNotification(kind: NotifyKind): void {
  if (!enabled) {
    return;
  }
  const type =
    kind === "success"
      ? Haptics.NotificationFeedbackType.Success
      : kind === "error"
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning;
  Haptics.notificationAsync(type).catch(() => undefined);
}

// Hook that backs the Preferences toggle. Seeds from the live module flag so
// the switch reflects the hydrated value, and writes through setHapticsEnabled
// so the change takes effect app-wide immediately.
export function useHapticsPref() {
  const [value, setValue] = useState(getHapticsEnabled());
  const set = useCallback((next: boolean) => {
    setHapticsEnabled(next);
    setValue(next);
  }, []);
  return { value, set };
}

import {
  checkForUpdateAsync,
  fetchUpdateAsync,
  isEnabled,
  reloadAsync,
} from "expo-updates";
import { useEffect } from "react";

async function checkAndApply(): Promise<void> {
  // Disabled in dev / Expo Go; only live in release builds.
  if (!isEnabled) {
    return;
  }
  try {
    const result = await checkForUpdateAsync();
    if (result.isAvailable) {
      await fetchUpdateAsync();
      await reloadAsync();
    }
  } catch {
    // Network/update errors must never block app start.
  }
}

/**
 * Layer B — OTA (EAS Update). Checks once on launch and, if a JS-only
 * update is available for this runtime version, fetches and reloads into
 * it before the user reaches the app. Silent; never throws.
 */
export function useOtaUpdates(): void {
  useEffect(() => {
    checkAndApply().catch(() => undefined);
  }, []);
}

import AsyncStorage from "@react-native-async-storage/async-storage";

/** Mutation kinds replayed by the offline queue (see app/(app)/_layout.tsx). */
export const UPSERT_IOS_KIND = "shieldSelection.upsertIos";
export const UPSERT_ANDROID_KIND = "shieldSelection.upsertAndroid";

const CACHE_KEY = "@barakah/shield-selection/v1";

/** Mirror the latest server selection locally so the shield scheduler still has
 *  the windows/tokens after a cold start while offline. */
export async function cacheShieldSelection(selection: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(selection));
  } catch {
    // best-effort
  }
}

export async function loadCachedShieldSelection<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

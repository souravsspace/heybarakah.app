import type { PrayerDay, PrayerTimesSource } from "@barakah/core/prayer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "prayer-times:v1";
const MAX_ENTRIES = 8;

export interface StoredPrayerLocation {
  city: string | null;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface StoredPrayerEntry {
  cacheKey: string;
  fetchedAt: number;
  location: StoredPrayerLocation;
  locationId: string;
  settings: { method: number; school: number };
  source: PrayerTimesSource;
  timings: PrayerDay[];
}

export interface StoredPrayerState {
  entries: Record<string, StoredPrayerEntry>;
  version: 1;
}

const INITIAL: StoredPrayerState = { version: 1, entries: {} };

export async function readPrayerStorage(): Promise<StoredPrayerState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL;
    }
    const parsed = JSON.parse(raw) as Partial<StoredPrayerState>;
    if (parsed.version !== 1 || !parsed.entries) {
      return INITIAL;
    }
    return { version: 1, entries: parsed.entries };
  } catch {
    return INITIAL;
  }
}

function pruneOldest(
  entries: Record<string, StoredPrayerEntry>
): Record<string, StoredPrayerEntry> {
  const keys = Object.keys(entries);
  if (keys.length <= MAX_ENTRIES) {
    return entries;
  }
  const sorted = keys
    .map((k) => ({ key: k, fetchedAt: entries[k].fetchedAt }))
    .sort((a, b) => a.fetchedAt - b.fetchedAt);
  const drop = sorted.slice(0, keys.length - MAX_ENTRIES);
  const next = { ...entries };
  for (const item of drop) {
    delete next[item.key];
  }
  return next;
}

export async function writePrayerEntry(
  entry: StoredPrayerEntry
): Promise<StoredPrayerState> {
  const current = await readPrayerStorage();
  const merged: Record<string, StoredPrayerEntry> = {
    ...current.entries,
    [entry.cacheKey]: entry,
  };
  const next: StoredPrayerState = {
    version: 1,
    entries: pruneOldest(merged),
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // swallow storage failures; in-memory state remains source of truth
  }
  return next;
}

export async function clearPrayerStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // swallow
  }
}

export function findEntryByLocationId(
  state: StoredPrayerState,
  locationId: string
): StoredPrayerEntry | null {
  let latest: StoredPrayerEntry | null = null;
  for (const entry of Object.values(state.entries)) {
    if (entry.locationId !== locationId) {
      continue;
    }
    if (!latest || entry.fetchedAt > latest.fetchedAt) {
      latest = entry;
    }
  }
  return latest;
}

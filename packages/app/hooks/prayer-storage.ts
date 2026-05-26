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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidLocation(value: unknown): value is StoredPrayerLocation {
  if (!value || typeof value !== "object") {
    return false;
  }
  const loc = value as Record<string, unknown>;
  return (
    isFiniteNumber(loc.latitude) &&
    isFiniteNumber(loc.longitude) &&
    typeof loc.timezone === "string" &&
    (loc.city === null || typeof loc.city === "string") &&
    (loc.countryCode === null || typeof loc.countryCode === "string")
  );
}

function isValidTimingsArray(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  for (const day of value) {
    if (!day || typeof day !== "object") {
      return false;
    }
    const d = day as Record<string, unknown>;
    if (typeof d.date !== "string" || !d.timings) {
      return false;
    }
    const t = d.timings as Record<string, unknown>;
    for (const name of ["fajr", "dhuhr", "asr", "maghrib", "isha"]) {
      if (typeof t[name] !== "string") {
        return false;
      }
    }
  }
  return true;
}

function isValidEntry(value: unknown): value is StoredPrayerEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.cacheKey === "string" &&
    typeof entry.locationId === "string" &&
    isFiniteNumber(entry.fetchedAt) &&
    isValidLocation(entry.location) &&
    isValidTimingsArray(entry.timings) &&
    typeof entry.source === "string"
  );
}

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
    const validated: Record<string, StoredPrayerEntry> = {};
    for (const [key, value] of Object.entries(parsed.entries)) {
      if (isValidEntry(value)) {
        validated[key] = value;
      }
    }
    return { version: 1, entries: validated };
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

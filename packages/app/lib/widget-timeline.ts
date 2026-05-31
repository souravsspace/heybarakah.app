import { derivePrayerState, hijriDateString } from "@/lib/widget-derive";
import type { WidgetProps, WidgetSnapshot } from "@/lib/widgets-native";

/**
 * Pure, react-native-free timeline construction for the home-screen widgets.
 * Kept separate from `widgets-native.ts` (which imports `react-native`) so the
 * derivation can be unit-tested under `bun:test`, mirroring `widget-derive.ts`.
 */

type PlistValue =
  | boolean
  | number
  | string
  | PlistValue[]
  | { [key: string]: PlistValue };

/**
 * Strip values that App Group `UserDefaults` cannot persist. The Expo bridge
 * converts a JS `null` into `NSNull` (and leaves a non-finite number as-is); a
 * single such value anywhere in the pushed timeline array makes
 * `UserDefaults.set` reject the whole write, so the widget extension reads an
 * empty timeline and WidgetKit shows the placeholder (`CHSErrorDomain 1101`).
 * Recursively drop `null`/`undefined` keys/elements and coerce non-finite
 * numbers to `0`, leaving a pure property-list object (string/number/bool/
 * array/dict). Dropped keys are safe: every widget fn already defaults the
 * props it reads (e.g. `props.streak ?? {…}`).
 */
function toPlistSafe(value: unknown): PlistValue | undefined {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => toPlistSafe(item))
      .filter((item): item is PlistValue => item !== undefined);
  }
  if (typeof value === "object") {
    const out: { [key: string]: PlistValue } = {};
    for (const [key, item] of Object.entries(value)) {
      const safe = toPlistSafe(item);
      if (safe !== undefined) {
        out[key] = safe;
      }
    }
    return out;
  }
  return;
}

const SEED_FUTURE_HOURS = [1, 2, 3, 6, 12] as const;
const HOUR_MS = 3_600_000;

/**
 * Timeline entries at "now" plus every future prayer boundary — the moments the
 * displayed prayer and countdown change. Mirrors the old native provider's
 * `.after(boundary)` timeline; the widget layouts derive their state from each
 * entry's `ctx.date`. With no prayers (the startup seed) there is only a single
 * "now" entry, which `policy: .atEnd` exhausts immediately; pad it with a few
 * hourly future entries so the stored timeline always has runway and never
 * starves back to empty (another path to `CHSErrorDomain 1101`). Props are run
 * through `toPlistSafe` so the App Group write always persists.
 */
export function buildTimelineEntries(
  snapshot: WidgetSnapshot
): { date: Date; props: WidgetProps }[] {
  const now = Date.now();
  const timestamps = new Set<number>([now]);
  for (const prayer of snapshot.prayers) {
    for (const iso of [prayer.startISO, prayer.endISO]) {
      const t = Date.parse(iso);
      if (!Number.isNaN(t) && t > now) {
        timestamps.add(t);
      }
    }
  }
  if (timestamps.size === 1) {
    for (const h of SEED_FUTURE_HOURS) {
      timestamps.add(now + h * HOUR_MS);
    }
  }
  return [...timestamps]
    .sort((a, b) => a - b)
    .map((t) => ({
      date: new Date(t),
      props: toPlistSafe({
        ...snapshot,
        salah: derivePrayerState(snapshot, t),
        hijri: hijriDateString(t),
      }) as unknown as WidgetProps,
    }));
}

/**
 * Empty-but-valid snapshot used to seed the timeline at startup. Every field is
 * present so `buildTimelineEntries`/`derivePrayerState` produce a single valid
 * entry without throwing (no prayers → fallback prayer state, empty ayah/streak).
 */
export const DEFAULT_SNAPSHOT: WidgetSnapshot = {
  ayah: { arabic: "", reference: "", surah: "", translation: "" },
  date: "",
  dhikr: { count: 0, sessionTotal: 0, target: 33 },
  generatedAt: "",
  lockNow: null,
  prayers: [],
  streak: { best: 0, days: 0, history: [], todayDone: 0 },
  tomorrowFajrISO: null,
  tz: "",
  v: 1,
};

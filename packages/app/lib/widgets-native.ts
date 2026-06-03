import { Platform } from "react-native";
import type { PrayerState } from "@/lib/widget-derive";
import { buildTimelineEntries, DEFAULT_SNAPSHOT } from "@/lib/widget-timeline";

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
  dhikr: {
    arabic: string;
    count: number;
    sessionTotal: number;
    target: number;
  };
  generatedAt: string;
  lockNow: { name: PrayerName; endISO: string } | null;
  prayers: WidgetPrayerEntry[];
  streak: { best: number; days: number; history: number[]; todayDone: number };
  tomorrowFajrISO: string | null;
  tz: string;
  v: 1;
}

/**
 * What each timeline entry actually pushes to a widget. The `expo-widgets`
 * babel transform stringifies the widget layout with no closure or imports, so
 * the widget functions cannot call `derivePrayerState`/`hijriDateString` at
 * render time — those refs would be undefined inside the widget JS runtime and
 * the render would throw (showing the WidgetKit "Please adopt containerBackground
 * API" placeholder). Instead the derived prayer state and Hijri label are
 * computed app-side per entry date here and read straight off `props`.
 */
export interface WidgetProps extends WidgetSnapshot {
  hijri: string;
  salah: PrayerState;
}

const isIOS = Platform.OS === "ios";

// `expo-widgets` constructs native `Widget` objects at module-eval time, which
// only exist on iOS. Import the registry lazily and behind a platform guard so
// the widget modules are never evaluated on Android/web.
async function getWidgets() {
  if (!isIOS) {
    return [];
  }
  try {
    const mod = await import("@/widgets");
    return mod.WIDGETS;
  } catch {
    return [];
  }
}

/**
 * Constructing each `Widget` writes its layout string to app-group storage, but
 * the widget extension's `getTimeline` returns `Timeline(entries: [])` until a
 * timeline is written — and WidgetKit rejects an empty timeline with
 * `CHSErrorDomain 1101 "Returned view collection was either nil or empty"`,
 * showing the placeholder on EVERY widget. The real timeline (`setSnapshot`) is
 * gated behind an active subscription / reaching home, so a fresh install or
 * non-subscriber would leave no entries at all. Seeding a default snapshot here
 * (called unconditionally at app startup) guarantees each widget always has at
 * least one timeline entry; real data overwrites it once available.
 */
export async function registerWidgets(): Promise<void> {
  await setSnapshot(DEFAULT_SNAPSHOT);
}

export async function setSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  const widgets = await getWidgets();
  if (widgets.length === 0) {
    return;
  }
  const entries = buildTimelineEntries(snapshot);
  for (const widget of widgets) {
    widget.updateTimeline(entries);
  }
  // TEMP probe: read the app's own write back through the App Group suite to
  // confirm the timeline actually persisted (>0 ⇒ write fixed; 0 ⇒ deeper
  // storage/cfprefsd issue). Remove once verified green on device.
  if (__DEV__) {
    try {
      const persisted = await widgets[0].getTimeline();
      console.log(
        `[widgets] seeded ${entries.length} entries; read back ${persisted.length}`
      );
    } catch (error) {
      console.log("[widgets] getTimeline probe failed", error);
    }
  }
}

export async function reloadTimelines(): Promise<void> {
  const widgets = await getWidgets();
  for (const widget of widgets) {
    widget.reload();
  }
}

export function startLockActivity(args: {
  endISO: string;
  name: PrayerName;
  startISO: string;
}): Promise<string> {
  if (!isIOS) {
    return Promise.reject(new Error("ExpoWidgets: iOS only"));
  }
  return import("@/widgets/lock-activity").then((m) =>
    m.startLockActivityInstance(args)
  );
}

export async function endLockActivity(id: string): Promise<void> {
  if (!isIOS) {
    return;
  }
  const m = await import("@/widgets/lock-activity");
  await m.endLockActivityInstance(id);
}

export async function endAllLockActivities(): Promise<void> {
  if (!isIOS) {
    return;
  }
  const m = await import("@/widgets/lock-activity");
  await m.endAllLockActivityInstances();
}

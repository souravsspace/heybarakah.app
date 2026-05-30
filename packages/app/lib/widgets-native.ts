import { Platform } from "react-native";

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
  dhikr: { count: number; sessionTotal: number; target: number };
  generatedAt: string;
  lockNow: { name: PrayerName; endISO: string } | null;
  prayers: WidgetPrayerEntry[];
  streak: { best: number; days: number; history: number[]; todayDone: number };
  tomorrowFajrISO: string | null;
  tz: string;
  v: 1;
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
 * Timeline entries at "now" plus every future prayer boundary — the moments the
 * displayed prayer and countdown change. Mirrors the old native provider's
 * `.after(boundary)` timeline; the widget layouts derive their state from each
 * entry's `ctx.date`.
 */
function buildTimelineEntries(
  snapshot: WidgetSnapshot
): { date: Date; props: WidgetSnapshot }[] {
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
  return [...timestamps]
    .sort((a, b) => a - b)
    .map((t) => ({ date: new Date(t), props: snapshot }));
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

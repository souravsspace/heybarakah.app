import type { PrayerDay } from "@barakah/core/prayer";
import type {
  PrayerName,
  WidgetPrayerEntry,
  WidgetSnapshot,
} from "expo-widget-bridge";
import type { Ayah } from "@/constants/ayahs";
import { lockBoundsMinutes } from "@/lib/prayer-window-config";

const PRAYER_ORDER: readonly PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseHHmm(raw: string): { hour: number; minute: number } | null {
  const [hourText, minuteText] = raw.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

function localISO(dateKey: string, hour: number, minute: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const local = new Date(y, m - 1, d, hour, minute, 0, 0);
  const offsetMin = -local.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const tz = `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
  return `${dateKey}T${pad2(hour)}:${pad2(minute)}:00${tz}`;
}

function buildPrayerEntry(
  name: PrayerName,
  day: PrayerDay
): WidgetPrayerEntry | null {
  const raw = (day.timings as Record<string, string>)[name];
  const parsed = parseHHmm(raw);
  if (!parsed) {
    return null;
  }
  const minutes = parsed.hour * 60 + parsed.minute;
  const bounds = lockBoundsMinutes(name, minutes);
  const startHour = Math.floor(bounds.start / 60);
  const startMinute = bounds.start % 60;
  const endHour = Math.floor(bounds.end / 60);
  const endMinute = bounds.end % 60;
  return {
    name,
    adhanISO: localISO(day.date, parsed.hour, parsed.minute),
    startISO: localISO(day.date, startHour, startMinute),
    endISO: localISO(day.date, endHour, endMinute),
  };
}

export interface BuildSnapshotInput {
  ayah: Ayah;
  dhikrCount: number;
  dhikrTarget: number;
  streakDays: number;
  timezone: string;
  today: PrayerDay | null;
  todayDateKey: string;
  tomorrow: PrayerDay | null;
}

export function buildWidgetSnapshot(
  input: BuildSnapshotInput
): WidgetSnapshot | null {
  const { today, tomorrow, todayDateKey, timezone, ayah } = input;
  if (!today) {
    return null;
  }

  const prayers: WidgetPrayerEntry[] = [];
  for (const name of PRAYER_ORDER) {
    const entry = buildPrayerEntry(name, today);
    if (entry) {
      prayers.push(entry);
    }
  }
  if (prayers.length === 0) {
    return null;
  }

  let tomorrowFajrISO: string | null = null;
  if (tomorrow) {
    const parsed = parseHHmm(tomorrow.timings.fajr);
    if (parsed) {
      tomorrowFajrISO = localISO(tomorrow.date, parsed.hour, parsed.minute);
    }
  }

  return {
    v: 1,
    generatedAt: new Date().toISOString(),
    tz: timezone,
    date: todayDateKey,
    prayers,
    tomorrowFajrISO,
    streak: { days: input.streakDays },
    dhikr: { count: input.dhikrCount, target: input.dhikrTarget },
    ayah: {
      arabic: ayah.arabic,
      translation: ayah.translation,
      reference: ayah.reference,
    },
    lockNow: null,
  };
}

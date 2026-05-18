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

function tzOffsetSuffix(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  return `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
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

function localISO(
  dateKey: string,
  hour: number,
  minute: number,
  tzSuffix: string
): string {
  return `${dateKey}T${pad2(hour)}:${pad2(minute)}:00${tzSuffix}`;
}

function adhanMinutes(hhmm: string): number | null {
  const parsed = parseHHmm(hhmm);
  if (!parsed) {
    return null;
  }
  return parsed.hour * 60 + parsed.minute;
}

function buildPrayerEntry(
  name: PrayerName,
  day: PrayerDay,
  tzSuffix: string
): WidgetPrayerEntry | null {
  const raw = (day.timings as Record<string, string>)[name];
  const minutes = adhanMinutes(raw);
  if (minutes === null) {
    return null;
  }
  const bounds = lockBoundsMinutes(name, minutes);
  const startHour = Math.floor(bounds.start / 60);
  const startMinute = bounds.start % 60;
  const endHour = Math.floor(bounds.end / 60);
  const endMinute = bounds.end % 60;
  return {
    name,
    startISO: localISO(day.date, startHour, startMinute, tzSuffix),
    endISO: localISO(day.date, endHour, endMinute, tzSuffix),
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
  const offsetMinutes = -new Date().getTimezoneOffset();
  const tzSuffix = tzOffsetSuffix(offsetMinutes);

  const prayers: WidgetPrayerEntry[] = [];
  for (const name of PRAYER_ORDER) {
    const entry = buildPrayerEntry(name, today, tzSuffix);
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
      tomorrowFajrISO = localISO(
        tomorrow.date,
        parsed.hour,
        parsed.minute,
        tzSuffix
      );
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

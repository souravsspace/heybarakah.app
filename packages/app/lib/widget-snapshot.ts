import type { PrayerDay } from "@barakah/core/prayer";
import type { Ayah } from "@/constants/ayahs";
import { PRAYER_ORDER, pad2 } from "@/lib/date-utils";
import { lockBoundsMinutes } from "@/lib/prayer-window-config";
import type {
  PrayerName,
  WidgetPrayerEntry,
  WidgetSnapshot,
} from "@/lib/widgets-native";

function parseHHmm(
  raw: string | undefined
): { hour: number; minute: number } | null {
  if (typeof raw !== "string") {
    return null;
  }
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
  // Read components back from the normalized Date so an end time that overflows
  // past midnight (e.g. isha window minutes > 1440) rolls to the next day and the
  // offset matches that instant — never an invalid "T24:58" string Swift rejects.
  const datePart = `${local.getFullYear()}-${pad2(local.getMonth() + 1)}-${pad2(
    local.getDate()
  )}`;
  return `${datePart}T${pad2(local.getHours())}:${pad2(local.getMinutes())}:00${tz}`;
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
  dhikrSessionTotal: number;
  dhikrTarget: number;
  streakBest: number;
  streakDays: number;
  streakHistory: number[];
  streakTodayDone: number;
  timezone: string;
  today: PrayerDay | null;
  todayDateKey: string;
  tomorrow: PrayerDay | null;
}

/** Split "Al-Ankabut 29:45" → { surah: "Al-Ankabut", reference: "29:45" }. */
function splitReference(raw: string): { surah: string; reference: string } {
  const lastSpace = raw.lastIndexOf(" ");
  if (lastSpace <= 0) {
    // No surah-name portion (no space, or a leading space) — show the whole
    // string as the heading instead of duplicating it into the numeric ref.
    return { surah: raw.trim(), reference: "" };
  }
  return {
    surah: raw.slice(0, lastSpace),
    reference: raw.slice(lastSpace + 1),
  };
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
    streak: {
      days: input.streakDays,
      best: input.streakBest,
      history: input.streakHistory,
      todayDone: input.streakTodayDone,
    },
    dhikr: {
      count: input.dhikrCount,
      target: input.dhikrTarget,
      sessionTotal: input.dhikrSessionTotal,
    },
    ayah: {
      arabic: ayah.arabic,
      translation: ayah.translation,
      ...splitReference(ayah.reference),
    },
    lockNow: null,
  };
}

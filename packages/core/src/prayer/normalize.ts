import type { PrayerDay, PrayerName, PrayerSourceComparison } from "./types";

const TIME_PATTERN = /(\d{1,2}):(\d{2})/;

export function normalizeAlAdhanTimingString(time: string): string {
  const match = time.match(TIME_PATTERN);
  if (!match) {
    throw new Error(`Invalid prayer timing string: ${time}`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !(Number.isInteger(hour) && Number.isInteger(minute)) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(`Invalid prayer timing value: ${time}`);
  }

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  if (!(year && month && day)) {
    throw new Error(`Invalid date key: ${date}`);
  }
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: string, days: number): string {
  const parsed = parseDateKey(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatDateKey(parsed);
}

export function slicePrayerDays(
  days: PrayerDay[],
  startDate: string,
  count: number
): PrayerDay[] {
  const wanted = new Set(
    Array.from({ length: count }, (_, index) => addDays(startDate, index))
  );
  return days.filter((day) => wanted.has(day.date)).slice(0, count);
}

function timeToMinutes(value: string): number {
  const [hour, minute] = normalizeAlAdhanTimingString(value)
    .split(":")
    .map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

export function comparePrayerDays(
  primary: PrayerDay[],
  fallback: PrayerDay[]
): PrayerSourceComparison {
  const fallbackByDate = new Map(fallback.map((day) => [day.date, day]));
  let maxDifferenceMinutes = 0;

  const perDay = primary.map((day) => {
    const fallbackDay = fallbackByDate.get(day.date);
    const differences: Partial<Record<PrayerName, number>> = {};
    if (fallbackDay) {
      for (const prayer of [
        "fajr",
        "sunrise",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
      ] as const) {
        const diff = Math.abs(
          timeToMinutes(day.timings[prayer]) -
            timeToMinutes(fallbackDay.timings[prayer])
        );
        differences[prayer] = diff;
        maxDifferenceMinutes = Math.max(maxDifferenceMinutes, diff);
      }
    }
    return { date: day.date, differences };
  });

  return { maxDifferenceMinutes, perDay };
}

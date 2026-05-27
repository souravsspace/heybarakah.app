export type LoggablePrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerStatus = "early" | "on_time" | "late" | "qada" | "missed";

export type ClassifiableStatus = Exclude<PrayerStatus, "missed">;

export type PrayerSchedule = Record<LoggablePrayerName, string>;

const PRAYER_ORDER: LoggablePrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function addDayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function wallClock(
  ms: number,
  timezone: string
): { date: string; time: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(ms));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  let hour = get("hour");
  if (hour === "24") {
    hour = "00";
  }
  return { date, time: `${hour}:${get("minute")}` };
}

export function classifyPrayerStatus(input: {
  prayedAt: number;
  prayer: LoggablePrayerName;
  schedule: PrayerSchedule;
  dateKey: string;
  timezone: string;
  nextDayFajr?: string;
}): ClassifiableStatus {
  if (!DATE_KEY_PATTERN.test(input.dateKey)) {
    throw new Error("Invalid dateKey");
  }
  for (const name of PRAYER_ORDER) {
    if (!TIME_PATTERN.test(input.schedule[name])) {
      throw new Error(`Invalid schedule time for ${name}`);
    }
  }
  if (input.nextDayFajr && !TIME_PATTERN.test(input.nextDayFajr)) {
    throw new Error("Invalid nextDayFajr");
  }

  const wall = wallClock(input.prayedAt, input.timezone);
  const prayedKey = `${wall.date}T${wall.time}`;
  const tomorrow = addDayKey(input.dateKey);

  const idx = PRAYER_ORDER.indexOf(input.prayer);
  const currentStart = `${input.dateKey}T${input.schedule[input.prayer]}`;

  let nextStart: string;
  if (idx < PRAYER_ORDER.length - 1) {
    const nextName = PRAYER_ORDER[idx + 1];
    nextStart = `${input.dateKey}T${input.schedule[nextName]}`;
  } else {
    nextStart = `${tomorrow}T${input.nextDayFajr ?? input.schedule.fajr}`;
  }

  const qadaStart = input.prayer === "isha" ? nextStart : `${tomorrow}T00:00`;

  if (prayedKey < currentStart) {
    return "early";
  }
  if (prayedKey < nextStart) {
    return "on_time";
  }
  if (prayedKey < qadaStart) {
    return "late";
  }
  return "qada";
}

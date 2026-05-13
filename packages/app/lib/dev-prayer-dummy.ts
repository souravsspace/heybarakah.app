import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import type { WeekLogs } from "@/hooks/usePrayerLogs";

export const USE_DEV_DUMMY =
  (globalThis as { __DEV__?: boolean }).__DEV__ ?? false;

const PRAYERS: LoggablePrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

const DEV_DUMMY_STATUSES: Record<
  number,
  Partial<Record<LoggablePrayerName, PrayerStatus>>
> = {
  0: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "on_time",
  },
  1: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "late",
    maghrib: "on_time",
    isha: "on_time",
  },
  2: {
    fajr: "late",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "qada",
  },
  3: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "on_time",
  },
  4: {
    fajr: "missed",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "on_time",
  },
  5: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
  },
  6: {},
};

export function buildDummyWeek(days: { date: string }[]): WeekLogs {
  const map = new Map<string, PrayerStatus>();
  let onTime = 0;
  let late = 0;
  let qada = 0;
  let missed = 0;
  let total = 0;
  days.forEach((d, idx) => {
    const row = DEV_DUMMY_STATUSES[idx] ?? {};
    for (const p of PRAYERS) {
      const s = row[p];
      if (!s) {
        continue;
      }
      map.set(`${d.date}|${p}`, s);
      total += 1;
      if (s === "on_time") {
        onTime += 1;
      } else if (s === "late") {
        late += 1;
      } else if (s === "qada") {
        qada += 1;
      } else {
        missed += 1;
      }
    }
  });
  return {
    rows: [],
    getStatus: (date, prayer) => map.get(`${date}|${prayer}`),
    onTimeCount: onTime,
    lateCount: late,
    qadaCount: qada,
    missedCount: missed,
    totalLogged: total,
    loading: false,
  };
}

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface WidgetPrayerEntry {
  adhanISO: string;
  endISO: string;
  name: PrayerName;
  startISO: string;
}

export interface WidgetSnapshot {
  ayah: { arabic: string; translation: string; reference: string };
  date: string;
  dhikr: { count: number; target: number };
  generatedAt: string;
  lockNow: { name: PrayerName; endISO: string } | null;
  prayers: WidgetPrayerEntry[];
  streak: { days: number };
  tomorrowFajrISO: string | null;
  tz: string;
  v: 1;
}

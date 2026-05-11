export type PrayerName =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export type NotifiablePrayerName = Exclude<PrayerName, "sunrise">;

export type PrayerTimesSource = "aladhan" | "adhan-js" | "hybrid";

export interface PrayerTiming {
  iso?: string;
  name: PrayerName;
  time: string;
}

export interface PrayerLocation {
  city?: string;
  countryCode?: string;
  latitude: number;
  latitudeRounded?: number;
  longitude: number;
  longitudeRounded?: number;
  timezone: string;
}

export interface PrayerSettings {
  latitudeAdjustmentMethod?: number;
  method: number;
  midnightMode?: number;
  school: number;
  tune?: string;
}

export interface PrayerDay {
  date: string;
  hijriDate?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  method: number;
  school: number;
  source: PrayerTimesSource;
  timezone: string;
  timings: Record<PrayerName, string>;
}

export interface PrayerSourceComparison {
  maxDifferenceMinutes: number;
  perDay: Array<{
    date: string;
    differences: Partial<Record<PrayerName, number>>;
  }>;
}

export interface PrayerTimeCache {
  cacheKey: string;
  city?: string;
  comparison?: PrayerSourceComparison;
  countryCode?: string;
  createdAt: number;
  days: number;
  endDate: string;
  expiresAt: number;
  fallbackSource?: "adhan-js";
  generatedAt: number;
  latitude: number;
  latitudeAdjustmentMethod?: number;
  latitudeRounded?: number;
  longitude: number;
  longitudeRounded?: number;
  method: number;
  midnightMode?: number;
  primarySource: "aladhan" | "adhan-js";
  raw?: unknown;
  school: number;
  source: PrayerTimesSource;
  startDate: string;
  timezone: string;
  timings: PrayerDay[];
  tune?: string;
  updatedAt: number;
  userCacheKey: string;
  userId?: string;
}

export interface AlAdhanTimingMap {
  Asr?: string;
  Dhuhr?: string;
  Fajr?: string;
  Isha?: string;
  Maghrib?: string;
  Sunrise?: string;
  [key: string]: string | undefined;
}

export interface AlAdhanDayResponse {
  date?: {
    readable?: string;
    gregorian?: { date?: string };
    hijri?: { date?: string };
  };
  meta?: unknown;
  timings?: AlAdhanTimingMap;
}

export interface AlAdhanCalendarResponse {
  code?: number;
  data?: AlAdhanDayResponse[];
  status?: string;
}

export interface PrayerTimesRequestInput
  extends PrayerLocation,
    PrayerSettings {
  days?: number;
  startDate: string;
}

export interface PrayerTimesCacheKeyInput extends PrayerTimesRequestInput {
  days: number;
}

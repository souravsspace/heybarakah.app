import type { NotifiablePrayerName, PrayerName } from "./types";

export const PRAYER_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DEFAULT_PRAYER_DAYS = 7;
export const COORDINATE_PRECISION = 4;

export const PRAYER_NAMES = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const satisfies readonly PrayerName[];

export const NOTIFIABLE_PRAYER_NAMES = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const satisfies readonly NotifiablePrayerName[];

export const ALADHAN_METHOD_IDS = {
  KARACHI: 1,
  ISNA: 2,
  MUSLIM_WORLD_LEAGUE: 3,
  UMM_AL_QURA: 4,
  EGYPTIAN: 5,
  GULF: 8,
  KUWAIT: 9,
  QATAR: 10,
  SINGAPORE: 11,
  UOIF: 12,
  TURKEY: 13,
  RUSSIA: 14,
  MOONSIGHTING: 15,
} as const;

export const BANGLADESH_DEFAULT_PRAYER_SETTINGS = {
  method: ALADHAN_METHOD_IDS.KARACHI,
  school: 1,
} as const;

export const GLOBAL_DEFAULT_PRAYER_SETTINGS = {
  method: ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE,
  school: 0,
} as const;

export const APP_CALC_METHOD_TO_ALADHAN_METHOD = {
  karachi: ALADHAN_METHOD_IDS.KARACHI,
  isna: ALADHAN_METHOD_IDS.ISNA,
  mwl: ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE,
  "umm-al-qura": ALADHAN_METHOD_IDS.UMM_AL_QURA,
  egyptian: ALADHAN_METHOD_IDS.EGYPTIAN,
  custom: ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE,
} as const;

export const ALADHAN_BASE_URL = "https://api.aladhan.com/v1";

export const ALL_WINDOWS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

export type PrayerWindow = (typeof ALL_WINDOWS)[number];

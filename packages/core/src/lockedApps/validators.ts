import { v } from "convex/values";

export const prayerWindow = v.union(
  v.literal("fajr"),
  v.literal("dhuhr"),
  v.literal("asr"),
  v.literal("maghrib"),
  v.literal("isha")
);

export const ALL_WINDOWS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

export type PrayerWindow = (typeof ALL_WINDOWS)[number];

export const lockedAppFields = {
  appId: v.string(),
  bundleId: v.string(),
  scheme: v.string(),
  name: v.string(),
  installed: v.boolean(),
  enabled: v.boolean(),
  windows: v.array(prayerWindow),
  addedAt: v.number(),
};

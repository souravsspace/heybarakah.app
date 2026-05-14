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

export const shieldSelectionFields = {
  iosSelectionData: v.optional(v.string()),
  iosItemCount: v.optional(v.number()),
  androidPackageNames: v.optional(v.array(v.string())),
  windows: v.array(prayerWindow),
  enabled: v.boolean(),
  updatedAt: v.number(),
};

import { v } from "convex/values";

export const profileFields = {
  name: v.optional(v.string()),
  gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
  madhab: v.optional(
    v.union(
      v.literal("hanafi"),
      v.literal("shafii"),
      v.literal("maliki"),
      v.literal("hanbali"),
      v.literal("none")
    )
  ),
  consistency: v.optional(
    v.union(
      v.literal("never"),
      v.literal("sometimes"),
      v.literal("most"),
      v.literal("all")
    )
  ),
  struggle: v.optional(
    v.union(
      v.literal("phone"),
      v.literal("forgetting"),
      v.literal("fajr"),
      v.literal("khushu")
    )
  ),
  goal: v.optional(
    v.union(
      v.literal("all-five"),
      v.literal("khushu"),
      v.literal("phone-addiction"),
      v.literal("fajr")
    )
  ),
  calcMethod: v.optional(
    v.union(
      v.literal("isna"),
      v.literal("mwl"),
      v.literal("umm-al-qura"),
      v.literal("egyptian"),
      v.literal("karachi"),
      v.literal("custom")
    )
  ),
  strictness: v.optional(
    v.union(
      v.literal("adhan-iqama"),
      v.literal("full-window"),
      v.literal("custom")
    )
  ),
  locationGranted: v.optional(v.boolean()),
  notifGranted: v.optional(v.boolean()),
  prayersToLock: v.optional(
    v.object({
      fajr: v.boolean(),
      dhuhr: v.boolean(),
      asr: v.boolean(),
      maghrib: v.boolean(),
      isha: v.boolean(),
    })
  ),
  completedAt: v.optional(v.string()),
};

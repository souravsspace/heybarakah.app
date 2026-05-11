import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const productId = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("family")
);

const profileFields = {
  authUserId: v.string(),
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

export default defineSchema({
  users: defineTable(profileFields).index("by_authUserId", ["authUserId"]),
  subscriptions: defineTable({
    authUserId: v.string(),
    productId,
    status: v.literal("active"),
    source: v.literal("mock"),
    claimedAt: v.string(),
    expiresAt: v.optional(v.string()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_authUserId_status", ["authUserId", "status"]),
  prayerTimeCaches: defineTable({
    userId: v.optional(v.string()),
    cacheKey: v.string(),
    userCacheKey: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    latitudeRounded: v.number(),
    longitudeRounded: v.number(),
    timezone: v.string(),
    countryCode: v.optional(v.string()),
    city: v.optional(v.string()),
    method: v.number(),
    school: v.number(),
    latitudeAdjustmentMethod: v.optional(v.number()),
    midnightMode: v.optional(v.number()),
    tune: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    source: v.union(
      v.literal("aladhan"),
      v.literal("adhan-js"),
      v.literal("hybrid")
    ),
    primarySource: v.union(v.literal("aladhan"), v.literal("adhan-js")),
    fallbackSource: v.optional(v.literal("adhan-js")),
    timings: v.array(
      v.object({
        date: v.string(),
        hijriDate: v.optional(v.string()),
        timezone: v.string(),
        method: v.number(),
        school: v.number(),
        source: v.union(
          v.literal("aladhan"),
          v.literal("adhan-js"),
          v.literal("hybrid")
        ),
        location: v.object({ latitude: v.number(), longitude: v.number() }),
        timings: v.object({
          fajr: v.string(),
          sunrise: v.string(),
          dhuhr: v.string(),
          asr: v.string(),
          maghrib: v.string(),
          isha: v.string(),
        }),
      })
    ),
    comparison: v.optional(v.any()),
    raw: v.optional(v.any()),
    generatedAt: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_cacheKey", ["cacheKey"])
    .index("by_userCacheKey", ["userCacheKey"])
    .index("by_userId", ["userId"])
    .index("by_expiry", ["expiresAt"]),
});

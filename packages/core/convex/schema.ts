import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { shieldSelectionFields } from "../src/shieldSelection/validators";
import {
  productId,
  revenueCatPeriodType,
  revenueCatStore,
} from "../src/subscriptions/validators";
import { profileFields } from "../src/users/validators";

const userFields = { authUserId: v.string(), ...profileFields };

export default defineSchema({
  users: defineTable(userFields).index("by_authUserId", ["authUserId"]),
  subscriptions: defineTable({
    authUserId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    productId,
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    source: v.union(
      v.literal("mock"),
      v.literal("polar"),
      v.literal("revenuecat")
    ),
    claimedAt: v.optional(v.string()),
    activatedAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    polarCustomerId: v.optional(v.string()),
    polarProductId: v.optional(v.string()),
    polarOrderId: v.optional(v.string()),
    rcAppUserId: v.optional(v.string()),
    rcOriginalAppUserId: v.optional(v.string()),
    rcProductIdentifier: v.optional(v.string()),
    rcEntitlementId: v.optional(v.string()),
    rcStore: v.optional(revenueCatStore),
    rcPeriodType: v.optional(revenueCatPeriodType),
    rcWillRenew: v.optional(v.boolean()),
    rcLatestPurchaseAt: v.optional(v.string()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_authUserId_status", ["authUserId", "status"])
    .index("by_customerEmail", ["customerEmail"])
    .index("by_polarOrderId", ["polarOrderId"])
    .index("by_polarCustomerId", ["polarCustomerId"])
    .index("by_rcAppUserId", ["rcAppUserId"]),
  polarOrders: defineTable({
    polarOrderId: v.string(),
    polarCustomerId: v.optional(v.string()),
    customerEmail: v.string(),
    customerName: v.optional(v.string()),
    productId: v.optional(v.string()),
    totalAmount: v.number(),
    currency: v.string(),
    invoiceNumber: v.optional(v.string()),
    eventType: v.string(),
    receivedAt: v.string(),
    confirmedEmailAt: v.optional(v.string()),
    raw: v.optional(v.any()),
  })
    .index("by_polarOrderId", ["polarOrderId"])
    .index("by_customerEmail", ["customerEmail"])
    .index("by_polarCustomerId", ["polarCustomerId"]),
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
  prayerLogs: defineTable({
    authUserId: v.string(),
    date: v.string(),
    prayer: v.union(
      v.literal("fajr"),
      v.literal("dhuhr"),
      v.literal("asr"),
      v.literal("maghrib"),
      v.literal("isha")
    ),
    status: v.union(
      v.literal("on_time"),
      v.literal("late"),
      v.literal("qada"),
      v.literal("missed")
    ),
    prayedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_date_prayer", ["authUserId", "date", "prayer"])
    .index("by_user_updated", ["authUserId", "updatedAt"]),
  shieldSelection: defineTable({
    authUserId: v.string(),
    ...shieldSelectionFields,
  }).index("by_user", ["authUserId"]),
  dhikrDaily: defineTable({
    authUserId: v.string(),
    date: v.string(),
    count: v.number(),
    target: v.number(),
    updatedAt: v.number(),
  }).index("by_user_date", ["authUserId", "date"]),
  dhikrAggregate: defineTable({
    authUserId: v.string(),
    total: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["authUserId"]),
  userAchievements: defineTable({
    authUserId: v.string(),
    code: v.string(),
    unlockedAt: v.number(),
    seenAt: v.optional(v.number()),
  })
    .index("by_user", ["authUserId"])
    .index("by_user_code", ["authUserId", "code"])
    .index("by_user_seen", ["authUserId", "seenAt"]),
});

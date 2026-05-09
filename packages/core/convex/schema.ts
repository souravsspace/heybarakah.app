import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authUserId: v.string(),
    name: v.optional(v.string()),
    gender: v.optional(v.string()),
    madhab: v.optional(v.string()),
    consistency: v.optional(v.string()),
    struggle: v.optional(v.string()),
    goal: v.optional(v.string()),
    calcMethod: v.optional(v.string()),
    strictness: v.optional(v.string()),
    plan: v.optional(v.string()),
    trialStartedAt: v.optional(v.string()),
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
  }).index("by_authUserId", ["authUserId"]),
});

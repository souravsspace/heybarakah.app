import { v } from "convex/values";
import {
  calculateAdhanJsPrayerDays,
  comparePrayerDays,
  createPrayerTimesCacheKey,
  createUserPrayerTimesCacheKey,
  DEFAULT_PRAYER_DAYS,
  fetchAlAdhanCalendarByCoordinates,
  isAdhanJsSupportedMethod,
  normalizeAlAdhanCalendarResponse,
  PRAYER_CACHE_TTL_MS,
  type PrayerTimeCache,
  roundCoordinate,
  slicePrayerDays,
} from "../src/prayer";
import { internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const args = {
  latitude: v.number(),
  longitude: v.number(),
  timezone: v.string(),
  method: v.number(),
  school: v.number(),
  latitudeAdjustmentMethod: v.optional(v.number()),
  midnightMode: v.optional(v.number()),
  tune: v.optional(v.string()),
  startDate: v.string(),
  days: v.optional(v.number()),
};

export const getCachedPrayerTimes = query({
  args,
  handler: async (ctx, request) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const days = request.days ?? DEFAULT_PRAYER_DAYS;
    const cacheKey = createPrayerTimesCacheKey({ ...request, days });
    const userCacheKey = createUserPrayerTimesCacheKey(cacheKey, user?._id);
    const hit = await ctx.db
      .query("prayerTimeCaches")
      .withIndex("by_userCacheKey", (q) => q.eq("userCacheKey", userCacheKey))
      .unique();
    if (!hit) {
      return null;
    }
    if (hit.expiresAt <= Date.now()) {
      return null;
    }
    return hit;
  },
});

export const refreshPrayerTimes = action({
  args,
  handler: async (ctx, request) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const days = request.days ?? DEFAULT_PRAYER_DAYS;
    const cacheKey = createPrayerTimesCacheKey({ ...request, days });
    const userCacheKey = createUserPrayerTimesCacheKey(cacheKey, user?._id);

    const getCachedPrayerTimesRef = (
      internal as unknown as {
        prayerTimes: {
          getCachedPrayerTimes: Parameters<typeof ctx.runQuery>[0];
        };
      }
    ).prayerTimes.getCachedPrayerTimes;
    const upsertPrayerTimesCacheRef = (
      internal as unknown as {
        prayerTimes: {
          upsertPrayerTimesCache: Parameters<typeof ctx.runMutation>[0];
        };
      }
    ).prayerTimes.upsertPrayerTimesCache;

    const cached = await ctx.runQuery(getCachedPrayerTimesRef, {
      ...request,
      days,
    });
    if (cached) {
      return cached;
    }

    const normalized = await fetchAndNormalize({ ...request, days });
    const fallback = isAdhanJsSupportedMethod(request.method)
      ? (calculateAdhanJsPrayerDays({ ...request, days }) ?? [])
      : [];

    const finalTimings = normalized.length > 0 ? normalized : fallback;
    if (finalTimings.length === 0) {
      throw new Error("Unable to compute prayer times from any source");
    }

    const source =
      normalized.length > 0
        ? fallback.length > 0
          ? "hybrid"
          : "aladhan"
        : "adhan-js";
    const comparison =
      normalized.length > 0 && fallback.length > 0
        ? comparePrayerDays(normalized, fallback)
        : undefined;
    const now = Date.now();
    const payload: PrayerTimeCache = {
      userId: user?._id,
      cacheKey,
      userCacheKey,
      latitude: request.latitude,
      latitudeRounded: roundCoordinate(request.latitude),
      longitude: request.longitude,
      longitudeRounded: roundCoordinate(request.longitude),
      timezone: request.timezone,
      method: request.method,
      school: request.school,
      latitudeAdjustmentMethod: request.latitudeAdjustmentMethod,
      midnightMode: request.midnightMode,
      tune: request.tune,
      startDate: request.startDate,
      endDate: finalTimings.at(-1)?.date ?? request.startDate,
      days,
      source,
      primarySource: normalized.length > 0 ? "aladhan" : "adhan-js",
      fallbackSource:
        normalized.length > 0 && fallback.length > 0 ? "adhan-js" : undefined,
      timings: finalTimings,
      comparison,
      raw: undefined,
      generatedAt: now,
      expiresAt: now + PRAYER_CACHE_TTL_MS,
      createdAt: now,
      updatedAt: now,
    };

    return await ctx.runMutation(upsertPrayerTimesCacheRef, payload);
  },
});

export const upsertPrayerTimesCache = internalMutation({
  args: {
    userId: v.optional(v.string()),
    cacheKey: v.string(),
    userCacheKey: v.string(),
    latitude: v.number(),
    latitudeRounded: v.number(),
    longitude: v.number(),
    longitudeRounded: v.number(),
    timezone: v.string(),
    method: v.number(),
    school: v.number(),
    latitudeAdjustmentMethod: v.optional(v.number()),
    midnightMode: v.optional(v.number()),
    tune: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    city: v.optional(v.string()),
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
  },
  handler: async (ctx, request) => {
    const existing = await ctx.db
      .query("prayerTimeCaches")
      .withIndex("by_userCacheKey", (q) =>
        q.eq("userCacheKey", request.userCacheKey)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...request,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }
    const id = await ctx.db.insert("prayerTimeCaches", request);
    return await ctx.db.get(id);
  },
});

async function fetchAndNormalize(request: {
  latitude: number;
  longitude: number;
  timezone: string;
  method: number;
  school: number;
  startDate: string;
  days: number;
}) {
  const start = new Date(`${request.startDate}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + request.days - 1);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  try {
    const primary = await fetchAlAdhanCalendarByCoordinates(request);
    let days = normalizeAlAdhanCalendarResponse(primary, request);
    if (!sameMonth) {
      const nextMonthDate = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-01`;
      const extra = await fetchAlAdhanCalendarByCoordinates({
        ...request,
        startDate: nextMonthDate,
      });
      days = days.concat(
        normalizeAlAdhanCalendarResponse(extra, {
          ...request,
          startDate: nextMonthDate,
        })
      );
    }
    return slicePrayerDays(days, request.startDate, request.days);
  } catch {
    return [];
  }
}

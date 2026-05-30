import { ConvexError, v } from "convex/values";
import {
  ALADHAN_METHOD_IDS,
  calculateAdhanJsPrayerDays,
  comparePrayerDays,
  createPrayerTimesCacheKey,
  createUserPrayerTimesCacheKey,
  DEFAULT_PRAYER_DAYS,
  fetchAlAdhanCalendarByCoordinates,
  isAdhanJsSupportedMethod,
  normalizeAlAdhanCalendarResponse,
  PRAYER_CACHE_TTL_MS,
  roundCoordinate,
  slicePrayerDays,
} from "../../src/prayer";
import { api, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { action, internalMutation, query } from "../_generated/server";
import { authComponent } from "./auth";

const args = {
  latitude: v.number(),
  longitude: v.number(),
  timezone: v.string(),
  countryCode: v.optional(v.string()),
  city: v.optional(v.string()),
  method: v.number(),
  school: v.number(),
  latitudeAdjustmentMethod: v.optional(v.number()),
  midnightMode: v.optional(v.number()),
  tune: v.optional(v.string()),
  startDate: v.string(),
  days: v.optional(v.number()),
};

const SUPPORTED_METHODS = new Set<number>(Object.values(ALADHAN_METHOD_IDS));
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TUNE_PATTERN = /^-?\d+(,-?\d+){0,8}$/;

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function validateDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new ConvexError("invalid date");
  }
  const d = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateKey) {
    throw new ConvexError("invalid date");
  }
}

function validatePrayerRequest(request: {
  latitude: number;
  longitude: number;
  timezone: string;
  method: number;
  school: number;
  tune?: string;
  startDate: string;
  days?: number;
}) {
  if (request.latitude < -90 || request.latitude > 90) {
    throw new Error("Invalid latitude");
  }
  if (request.longitude < -180 || request.longitude > 180) {
    throw new Error("Invalid longitude");
  }
  if (!(request.timezone.trim() && isValidTimezone(request.timezone))) {
    throw new Error("Invalid timezone");
  }
  if (!SUPPORTED_METHODS.has(request.method)) {
    throw new Error("Unsupported prayer calculation method");
  }
  if (request.school !== 0 && request.school !== 1) {
    throw new Error("Unsupported school");
  }
  if (request.tune !== undefined && !TUNE_PATTERN.test(request.tune)) {
    throw new Error("Invalid tune format");
  }
  validateDateKey(request.startDate);
  if (request.days !== undefined && request.days !== DEFAULT_PRAYER_DAYS) {
    throw new Error("Only 7-day prayer windows are supported");
  }
}

function stripPrayerTimeCachePrivateFields(row: Doc<"prayerTimeCaches">) {
  const { city, countryCode, userCacheKey, userId, ...safe } = row;
  return safe;
}

export const getCachedPrayerTimes = query({
  args,
  handler: async (ctx, request) => {
    validatePrayerRequest(request);

    const days = DEFAULT_PRAYER_DAYS;
    const cacheKey = createPrayerTimesCacheKey({ ...request, days });

    const hits = await ctx.db
      .query("prayerTimeCaches")
      .withIndex("by_cacheKey", (q) => q.eq("cacheKey", cacheKey))
      .order("desc")
      .take(10);

    const now = Date.now();
    const valid = hits.find((h) => h.expiresAt > now && h.timings?.length > 0);
    return valid ? stripPrayerTimeCachePrivateFields(valid) : null;
  },
});

export const refreshPrayerTimes: ReturnType<typeof action> = action({
  args,
  handler: async (ctx, request) => {
    validatePrayerRequest(request);

    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const cached = await ctx.runQuery(
      api.lib.prayerTimes.getCachedPrayerTimes,
      request
    );
    if (cached) {
      return cached;
    }

    const days = DEFAULT_PRAYER_DAYS;
    const requestWithDays = { ...request, days };

    const cacheKey = createPrayerTimesCacheKey(requestWithDays);
    const userCacheKey = createUserPrayerTimesCacheKey(cacheKey, user._id);

    const normalized = await fetchAndNormalize(requestWithDays);
    const fallback = isAdhanJsSupportedMethod(requestWithDays.method)
      ? (calculateAdhanJsPrayerDays(requestWithDays) ?? [])
      : [];

    const finalTimings = normalized.length > 0 ? normalized : fallback;
    if (finalTimings.length === 0) {
      throw new Error("Unable to compute prayer times from any source");
    }

    const source: "aladhan" | "adhan-js" | "hybrid" =
      normalized.length > 0
        ? fallback.length > 0
          ? "hybrid"
          : "aladhan"
        : "adhan-js";

    const comparison =
      normalized.length > 0 && fallback.length > 0
        ? comparePrayerDays(normalized, fallback)
        : undefined;
    const primarySource: "aladhan" | "adhan-js" =
      normalized.length > 0 ? "aladhan" : "adhan-js";

    const now = Date.now();
    const payload = {
      userId: user._id,
      cacheKey,
      userCacheKey,
      latitude: requestWithDays.latitude,
      longitude: requestWithDays.longitude,
      latitudeRounded: roundCoordinate(requestWithDays.latitude),
      longitudeRounded: roundCoordinate(requestWithDays.longitude),
      timezone: requestWithDays.timezone,
      countryCode: requestWithDays.countryCode,
      city: requestWithDays.city,
      method: requestWithDays.method,
      school: requestWithDays.school,
      latitudeAdjustmentMethod: requestWithDays.latitudeAdjustmentMethod,
      midnightMode: requestWithDays.midnightMode,
      tune: requestWithDays.tune,
      startDate: requestWithDays.startDate,
      endDate: finalTimings.at(-1)?.date ?? requestWithDays.startDate,
      days,
      source,
      primarySource,
      fallbackSource:
        normalized.length > 0 && fallback.length > 0
          ? ("adhan-js" as const)
          : undefined,
      timings: finalTimings,
      comparison,
      raw: undefined,
      generatedAt: now,
      expiresAt: now + PRAYER_CACHE_TTL_MS,
      createdAt: now,
      updatedAt: now,
    };

    const fresh = await ctx.runMutation(
      internal.lib.prayerTimes.upsertPrayerTimesCache,
      payload
    );
    return fresh ? stripPrayerTimeCachePrivateFields(fresh) : null;
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
  },
  handler: async (ctx, request) => {
    const existing = await ctx.db
      .query("prayerTimeCaches")
      .withIndex("by_cacheKey", (q) => q.eq("cacheKey", request.cacheKey))
      .order("desc")
      .first();

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
  countryCode?: string;
  city?: string;
  method: number;
  school: number;
  latitudeAdjustmentMethod?: number;
  midnightMode?: number;
  tune?: string;
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
    let parsedDays = normalizeAlAdhanCalendarResponse(primary, request);

    if (!sameMonth) {
      const nextMonthStart = `${end.getUTCFullYear()}-${String(
        end.getUTCMonth() + 1
      ).padStart(2, "0")}-01`;
      const nextMonthResponse = await fetchAlAdhanCalendarByCoordinates({
        ...request,
        startDate: nextMonthStart,
      });
      parsedDays = parsedDays.concat(
        normalizeAlAdhanCalendarResponse(nextMonthResponse, {
          ...request,
          startDate: nextMonthStart,
        })
      );
    }

    return slicePrayerDays(parsedDays, request.startDate, request.days);
  } catch (err) {
    console.error("[prayerTimes] AlAdhan fetch failed", err);
    return [];
  }
}

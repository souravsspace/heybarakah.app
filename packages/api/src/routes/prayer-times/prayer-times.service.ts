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
  type PrayerDay,
  roundCoordinate,
  slicePrayerDays,
} from "@barakah/core/prayer";
import type { KVNamespace } from "@cloudflare/workers-types";
import { desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import type { Database } from "@/db";
import { prayerTimeCaches } from "@/db/schema";
import { createKVCache } from "@/lib/kv-cache";
import { UNPROCESSABLE_ENTITY } from "@/stoker/http-status-codes";

export interface PrayerRequest {
  city?: string;
  countryCode?: string;
  days?: number;
  latitude: number;
  latitudeAdjustmentMethod?: number;
  longitude: number;
  method: number;
  midnightMode?: number;
  school: number;
  startDate: string;
  timezone: string;
  tune?: string;
}

type CacheRow = typeof prayerTimeCaches.$inferSelect;
/** Public shape returned to clients — exact GPS + owner identity stripped. */
export type PublicPrayerCache = Omit<
  CacheRow,
  "city" | "countryCode" | "userCacheKey" | "userId" | "latitude" | "longitude"
>;

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

function invalid(message: string): never {
  throw new HTTPException(UNPROCESSABLE_ENTITY, { message });
}

/** Port of convex `validatePrayerRequest` — throws 422 on any bad field. */
export function validatePrayerRequest(request: PrayerRequest): void {
  if (request.latitude < -90 || request.latitude > 90) {
    invalid("Invalid latitude");
  }
  if (request.longitude < -180 || request.longitude > 180) {
    invalid("Invalid longitude");
  }
  if (!(request.timezone.trim() && isValidTimezone(request.timezone))) {
    invalid("Invalid timezone");
  }
  if (!SUPPORTED_METHODS.has(request.method)) {
    invalid("Unsupported prayer calculation method");
  }
  if (request.school !== 0 && request.school !== 1) {
    invalid("Unsupported school");
  }
  if (request.tune !== undefined && !TUNE_PATTERN.test(request.tune)) {
    invalid("Invalid tune format");
  }
  if (!DATE_KEY_PATTERN.test(request.startDate)) {
    invalid("invalid date");
  }
  const d = new Date(`${request.startDate}T00:00:00Z`);
  if (
    Number.isNaN(d.getTime()) ||
    d.toISOString().slice(0, 10) !== request.startDate
  ) {
    invalid("invalid date");
  }
  if (request.days !== undefined && request.days !== DEFAULT_PRAYER_DAYS) {
    invalid("Only 7-day prayer windows are supported");
  }
}

function strip(row: CacheRow): PublicPrayerCache {
  const {
    city: _city,
    countryCode: _countryCode,
    userCacheKey: _userCacheKey,
    userId: _userId,
    latitude: _latitude,
    longitude: _longitude,
    ...safe
  } = row;
  return safe;
}

function cache(kv: KVNamespace) {
  return createKVCache<PublicPrayerCache>(kv, "prayer");
}

async function readD1(
  db: Database,
  cacheKey: string
): Promise<CacheRow | null> {
  const [row] = await db
    .select()
    .from(prayerTimeCaches)
    .where(eq(prayerTimeCaches.cacheKey, cacheKey))
    .orderBy(desc(prayerTimeCaches.updatedAt))
    .limit(1);
  return row ?? null;
}

function isFresh(row: { expiresAt: number; timings: unknown }): boolean {
  return (
    row.expiresAt > Date.now() &&
    Array.isArray(row.timings) &&
    row.timings.length > 0
  );
}

/**
 * Read-only cache lookup: KV hot blob first, then the durable D1 record (which
 * backfills KV on a hit). Returns null on a miss — `refreshPrayerTimes`
 * computes. Ports convex `getCachedPrayerTimes` (no compute on read).
 */
export async function getCachedPrayerTimes(
  db: Database,
  kv: KVNamespace,
  request: PrayerRequest
): Promise<PublicPrayerCache | null> {
  validatePrayerRequest(request);
  const cacheKey = createPrayerTimesCacheKey({
    ...request,
    days: DEFAULT_PRAYER_DAYS,
  });

  const hot = await cache(kv).get(cacheKey);
  if (hot && isFresh(hot)) {
    return hot;
  }

  const row = await readD1(db, cacheKey);
  if (row && isFresh(row)) {
    const safe = strip(row);
    await writeHot(kv, cacheKey, safe);
    return safe;
  }
  return null;
}

async function writeHot(
  kv: KVNamespace,
  cacheKey: string,
  safe: PublicPrayerCache
): Promise<void> {
  const ttlSeconds = Math.max(
    60,
    Math.floor((safe.expiresAt - Date.now()) / 1000)
  );
  await cache(kv).set(cacheKey, safe, ttlSeconds);
}

/**
 * Upsert the durable D1 record by cacheKey and refresh the KV hot blob.
 * Internal — called by `refreshPrayerTimes` (and the cache-sweep cron, §9).
 */
export async function upsertPrayerTimesCache(
  db: Database,
  kv: KVNamespace,
  payload: Omit<CacheRow, "id"> & { id?: string }
): Promise<PublicPrayerCache> {
  const existing = await readD1(db, payload.cacheKey);
  const now = Date.now();
  if (existing) {
    await db
      .update(prayerTimeCaches)
      .set({ ...payload, createdAt: existing.createdAt, updatedAt: now })
      .where(eq(prayerTimeCaches.id, existing.id));
  } else {
    await db
      .insert(prayerTimeCaches)
      .values({ ...payload, id: payload.id ?? crypto.randomUUID() });
  }
  const fresh = (await readD1(db, payload.cacheKey)) as CacheRow;
  const safe = strip(fresh);
  await writeHot(kv, payload.cacheKey, safe);
  return safe;
}

async function fetchAndNormalize(
  request: PrayerRequest & { days: number }
): Promise<PrayerDay[]> {
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
      const next = await fetchAlAdhanCalendarByCoordinates({
        ...request,
        startDate: nextMonthStart,
      });
      parsedDays = parsedDays.concat(
        normalizeAlAdhanCalendarResponse(next, {
          ...request,
          startDate: nextMonthStart,
        })
      );
    }
    return slicePrayerDays(parsedDays, request.startDate, request.days);
  } catch {
    return [];
  }
}

/**
 * Compute-on-miss: returns the cached window if present, else fetches AlAdhan
 * (adhan-js fallback for supported methods), persists, and returns it. Ports
 * convex `refreshPrayerTimes` (authed at the route layer).
 */
export async function refreshPrayerTimes(
  db: Database,
  kv: KVNamespace,
  request: PrayerRequest,
  userId: string
): Promise<PublicPrayerCache> {
  validatePrayerRequest(request);
  const cached = await getCachedPrayerTimes(db, kv, request);
  if (cached) {
    return cached;
  }

  const days = DEFAULT_PRAYER_DAYS;
  const withDays = { ...request, days };
  const cacheKey = createPrayerTimesCacheKey(withDays);
  const userCacheKey = createUserPrayerTimesCacheKey(cacheKey, userId);

  const normalized = await fetchAndNormalize(withDays);
  const fallback = isAdhanJsSupportedMethod(withDays.method)
    ? (calculateAdhanJsPrayerDays(withDays) ?? [])
    : [];
  const finalTimings = normalized.length > 0 ? normalized : fallback;
  if (finalTimings.length === 0) {
    throw new HTTPException(UNPROCESSABLE_ENTITY, {
      message: "Unable to compute prayer times from any source",
    });
  }

  const source: CacheRow["source"] =
    normalized.length > 0
      ? fallback.length > 0
        ? "hybrid"
        : "aladhan"
      : "adhan-js";
  const primarySource: CacheRow["primarySource"] =
    normalized.length > 0 ? "aladhan" : "adhan-js";
  const comparison =
    normalized.length > 0 && fallback.length > 0
      ? comparePrayerDays(normalized, fallback)
      : null;
  const now = Date.now();

  return upsertPrayerTimesCache(db, kv, {
    userId,
    cacheKey,
    userCacheKey,
    latitude: withDays.latitude,
    longitude: withDays.longitude,
    latitudeRounded: roundCoordinate(withDays.latitude),
    longitudeRounded: roundCoordinate(withDays.longitude),
    timezone: withDays.timezone,
    countryCode: withDays.countryCode ?? null,
    city: withDays.city ?? null,
    method: withDays.method,
    school: withDays.school,
    latitudeAdjustmentMethod: withDays.latitudeAdjustmentMethod ?? null,
    midnightMode: withDays.midnightMode ?? null,
    tune: withDays.tune ?? null,
    startDate: withDays.startDate,
    endDate: finalTimings.at(-1)?.date ?? withDays.startDate,
    days,
    source,
    primarySource,
    fallbackSource:
      normalized.length > 0 && fallback.length > 0 ? "adhan-js" : null,
    timings: finalTimings,
    comparison,
    raw: null,
    generatedAt: now,
    expiresAt: now + PRAYER_CACHE_TTL_MS,
    createdAt: now,
    updatedAt: now,
  });
}

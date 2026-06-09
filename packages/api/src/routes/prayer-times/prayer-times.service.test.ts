import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDatabase } from "@/db";

import { prayerTimeCaches } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  getCachedPrayerTimes,
  type PrayerRequest,
  purgeExpiredPrayerCaches,
  refreshPrayerTimes,
} from "./prayer-times.service";

applyMigrations();

afterEach(() => vi.restoreAllMocks());

// ISNA (method 2) is adhan-js-supported, so blocking the network forces the
// pure local fallback — keeps the test hermetic + fast.
const request: PrayerRequest = {
  latitude: 23.8103,
  longitude: 90.4125,
  timezone: "Asia/Dhaka",
  method: 2,
  school: 1,
  startDate: "2026-06-08",
};

function blockNetwork() {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
}

describe("prayer-times service", () => {
  it("returns null on a cold cache (read does not compute)", async () => {
    const db = createDatabase(env.DB);
    expect(
      await getCachedPrayerTimes(db, env.KV, {
        ...request,
        startDate: "2026-07-01",
      })
    ).toBeNull();
  });

  it("computes via adhan-js fallback when AlAdhan is unreachable, then caches", async () => {
    blockNetwork();
    const db = createDatabase(env.DB);

    const fresh = await refreshPrayerTimes(db, env.KV, request, "user-a");
    expect(fresh.source).toBe("adhan-js");
    expect(fresh.timings?.length).toBe(7);
    // Private fields are stripped from the public record.
    expect(fresh).not.toHaveProperty("latitude");
    expect(fresh).not.toHaveProperty("userId");

    // Now a read hits the cache (KV or D1) without recomputing.
    const cached = await getCachedPrayerTimes(db, env.KV, request);
    expect(cached).not.toBeNull();
    expect(cached?.cacheKey).toBe(fresh.cacheKey);
  });

  it("rejects an unsupported method with 422", async () => {
    const db = createDatabase(env.DB);
    await expect(
      getCachedPrayerTimes(db, env.KV, { ...request, method: 999 })
    ).rejects.toMatchObject({ status: 422 });
  });

  it("rejects an out-of-range latitude with 422", async () => {
    const db = createDatabase(env.DB);
    await expect(
      refreshPrayerTimes(db, env.KV, { ...request, latitude: 200 }, "user-b")
    ).rejects.toMatchObject({ status: 422 });
  });
});

describe("purgeExpiredPrayerCaches", () => {
  function insertRow(cacheKey: string, expiresAt: number) {
    const db = createDatabase(env.DB);
    const t = Date.now();
    return db.insert(prayerTimeCaches).values({
      id: crypto.randomUUID(),
      cacheKey,
      userCacheKey: `anon:${cacheKey}`,
      latitude: 1,
      longitude: 1,
      latitudeRounded: 1,
      longitudeRounded: 1,
      timezone: "UTC",
      method: 2,
      school: 1,
      startDate: "2026-01-01",
      endDate: "2026-01-07",
      days: 7,
      source: "adhan-js",
      primarySource: "adhan-js",
      timings: [],
      generatedAt: t,
      expiresAt,
      createdAt: t,
      updatedAt: t,
    });
  }

  it("deletes only rows past their TTL", async () => {
    const db = createDatabase(env.DB);
    const now = Date.now();
    await insertRow("expired-key", now - 1000);
    await insertRow("fresh-key", now + 1_000_000);

    const removed = await purgeExpiredPrayerCaches(db, now);
    expect(removed).toBeGreaterThanOrEqual(1);

    expect(
      await db
        .select()
        .from(prayerTimeCaches)
        .where(eq(prayerTimeCaches.cacheKey, "expired-key"))
    ).toHaveLength(0);
    expect(
      await db
        .select()
        .from(prayerTimeCaches)
        .where(eq(prayerTimeCaches.cacheKey, "fresh-key"))
    ).toHaveLength(1);
  });
});

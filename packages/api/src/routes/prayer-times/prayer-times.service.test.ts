import { env } from "cloudflare:test";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";

import {
  getCachedPrayerTimes,
  type PrayerRequest,
  refreshPrayerTimes,
} from "./prayer-times.service";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

beforeAll(applyMigration);
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

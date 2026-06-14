import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { userAchievements, users } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  DEFAULT_TARGET,
  getPresetTotals,
  getToday,
  increment,
  incrementPreset,
  isValidDateKey,
  isValidPresetId,
  reset,
  setTarget,
} from "./dhikr.service";

applyMigrations();

const DATE = "2026-06-08";

describe("dhikr service", () => {
  it("validates date keys (rejects impossible dates)", () => {
    expect(isValidDateKey("2026-06-08")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("not-a-date")).toBe(false);
  });

  it("defaults to count 0 / DEFAULT_TARGET before any dhikr", async () => {
    const db = createDatabase(env.DB);
    expect(await getToday(db, "fresh-user", DATE)).toEqual({
      count: 0,
      target: DEFAULT_TARGET,
      sessionTotal: 0,
    });
  });

  it("increments, accumulates session total, and triggers achievement eval", async () => {
    const db = createDatabase(env.DB);
    const user = "dhikr-user";
    // Profile required so runEvaluate doesn't skip.
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date().toISOString() });

    expect(await increment(db, user, DATE, 1)).toBe(1);
    expect(await increment(db, user, DATE, 32)).toBe(33);

    const today = await getToday(db, user, DATE);
    expect(today.count).toBe(33);
    expect(today.sessionTotal).toBe(33);

    // first_dhikr unlocked via the inline runEvaluate.
    const ach = await db
      .select({ code: userAchievements.code })
      .from(userAchievements);
    expect(ach.map((a) => a.code)).toContain("first_dhikr");
  });

  it("accumulates across sequential increments (onConflict + atomic seed)", async () => {
    const db = createDatabase(env.DB);
    const user = "dhikr-accumulate";
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date().toISOString() });

    await increment(db, user, DATE, 5);
    await increment(db, user, DATE, 7);

    const today = await getToday(db, user, DATE);
    expect(today.count).toBe(12);
    expect(today.sessionTotal).toBe(12);
  });

  it("keeps the daily count and session aggregate in sync (batched write)", async () => {
    const db = createDatabase(env.DB);
    const user = "dhikr-batched";
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date().toISOString() });

    // First increment seeds the aggregate from the daily row inside one batch.
    expect(await increment(db, user, DATE, 3)).toBe(3);
    expect((await getToday(db, user, DATE)).sessionTotal).toBe(3);

    // A second increment on the conflict branch advances both in lockstep.
    expect(await increment(db, user, DATE, 4)).toBe(7);
    const after = await getToday(db, user, DATE);
    expect(after.count).toBe(7);
    expect(after.sessionTotal).toBe(7);
  });

  it("sets a custom target without changing the count", async () => {
    const db = createDatabase(env.DB);
    const user = "target-user";
    await setTarget(db, user, DATE, 99);
    const today = await getToday(db, user, DATE);
    expect(today.target).toBe(99);
    expect(today.count).toBe(0);
  });

  it("reset zeroes the day and decrements the session total", async () => {
    const db = createDatabase(env.DB);
    const user = "reset-user";
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date().toISOString() });
    await increment(db, user, DATE, 10);
    expect((await getToday(db, user, DATE)).sessionTotal).toBe(10);

    await reset(db, user, DATE);
    const after = await getToday(db, user, DATE);
    expect(after.count).toBe(0);
    expect(after.sessionTotal).toBe(0);
  });

  it("validates preset ids", () => {
    expect(isValidPresetId("subhanallah")).toBe(true);
    expect(isValidPresetId("lailaha")).toBe(true);
    expect(isValidPresetId("bogus")).toBe(false);
  });

  it("returns empty preset totals before any dhikr", async () => {
    const db = createDatabase(env.DB);
    expect(await getPresetTotals(db, "fresh-preset-user")).toEqual({
      totals: {},
      grandTotal: 0,
    });
  });

  it("increments per-preset totals and the grand total independently", async () => {
    const db = createDatabase(env.DB);
    const user = "preset-user";
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date().toISOString() });

    expect(await incrementPreset(db, user, "subhanallah", 7)).toEqual({
      presetTotal: 7,
      grandTotal: 7,
    });
    expect(await incrementPreset(db, user, "subhanallah", 3)).toEqual({
      presetTotal: 10,
      grandTotal: 10,
    });
    // A different preset keeps its own total; the grand total spans both.
    expect(await incrementPreset(db, user, "alhamdulillah", 5)).toEqual({
      presetTotal: 5,
      grandTotal: 15,
    });

    const { totals, grandTotal } = await getPresetTotals(db, user);
    expect(totals).toEqual({ subhanallah: 10, alhamdulillah: 5 });
    expect(grandTotal).toBe(15);
  });

  it("unlocks dhikr achievements off the grand total", async () => {
    const db = createDatabase(env.DB);
    const user = "preset-ach-user";
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date().toISOString() });

    await incrementPreset(db, user, "allahuakbar", 1);

    const ach = await db
      .select({ code: userAchievements.code })
      .from(userAchievements);
    expect(ach.map((a) => a.code)).toContain("first_dhikr");
  });
});

import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { userAchievements, users } from "@/db/schema";

import {
  DEFAULT_TARGET,
  getToday,
  increment,
  isValidDateKey,
  reset,
  setTarget,
} from "./dhikr.service";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

const DATE = "2026-06-08";

describe("dhikr service", () => {
  beforeAll(applyMigration);

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
});

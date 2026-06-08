import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { userAchievementCounters, users } from "@/db/schema";

import {
  clearPrayer,
  getMyWeek,
  getStreak,
  isValidDateKey,
  logPrayer,
  PRAYERS,
} from "./prayer-logs.service";

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

async function seedProfile(db: ReturnType<typeof createDatabase>, id: string) {
  await db
    .insert(users)
    .values({ authUserId: id, completedAt: new Date().toISOString() });
}

describe("prayer-logs service", () => {
  beforeAll(applyMigration);

  it("validates date keys", () => {
    expect(isValidDateKey(DATE)).toBe(true);
    expect(isValidDateKey("2026-13-01")).toBe(false);
  });

  it("logs a prayer, returns streak + unlocked, and updates counters", async () => {
    const db = createDatabase(env.DB);
    const user = "pl-user";
    await seedProfile(db, user);

    const result = await logPrayer(db, user, {
      date: DATE,
      prayer: "fajr",
      status: "on_time",
    });
    expect(result.streak.asOf).toBe(DATE);
    expect(result.streak.todayDone).toBe(1);
    expect(Array.isArray(result.unlocked)).toBe(true);

    const [counter] = await db
      .select()
      .from(userAchievementCounters)
      .where(eq(userAchievementCounters.authUserId, user));
    expect(counter.onTimePrayerLogs).toBe(1);
    expect(counter.fajrOnTimePrayerLogs).toBe(1);
  });

  it("counts a complete day as a streak of 1", async () => {
    const db = createDatabase(env.DB);
    const user = "streak-user";
    await seedProfile(db, user);
    for (const prayer of PRAYERS) {
      await logPrayer(db, user, { date: DATE, prayer, status: "on_time" });
    }
    const streak = await getStreak(db, user, DATE);
    expect(streak.todayDone).toBe(5);
    expect(streak.days).toBe(1);

    const week = await getMyWeek(db, user, DATE);
    expect(week.length).toBe(5);
  });

  it("clearPrayer removes the log and decrements counters", async () => {
    const db = createDatabase(env.DB);
    const user = "clear-user";
    await seedProfile(db, user);
    await logPrayer(db, user, { date: DATE, prayer: "asr", status: "qada" });
    await clearPrayer(db, user, DATE, "asr");

    const week = await getMyWeek(db, user, DATE);
    expect(week.length).toBe(0);
    const [counter] = await db
      .select()
      .from(userAchievementCounters)
      .where(eq(userAchievementCounters.authUserId, user));
    expect(counter.qadaPrayerLogs).toBe(0);
  });
});

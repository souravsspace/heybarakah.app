import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { prayerLogs, userAchievementCounters, users } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  clearPrayer,
  getMyWeek,
  getStreak,
  isValidDateKey,
  logPrayer,
  PRAYERS,
} from "./prayer-logs.service";

applyMigrations();

const DATE = "2026-06-08";

async function seedProfile(db: ReturnType<typeof createDatabase>, id: string) {
  await db
    .insert(users)
    .values({ authUserId: id, completedAt: new Date().toISOString() });
}

describe("prayer-logs service", () => {
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

  it("writes are atomic — db.batch rolls back every statement on failure", async () => {
    const db = createDatabase(env.DB);
    const user = "atomic-user";
    await seedProfile(db, user);

    // A PK collision inside the batch must abort the whole batch, leaving
    // neither row behind — the guarantee logPrayer's log+counter write relies on.
    const id = crypto.randomUUID();
    const now = Date.now();
    const first = db.insert(prayerLogs).values({
      id,
      authUserId: user,
      date: DATE,
      prayer: "isha",
      status: "on_time",
      updatedAt: now,
    });
    const collision = db.insert(prayerLogs).values({
      id,
      authUserId: user,
      date: DATE,
      prayer: "fajr",
      status: "on_time",
      updatedAt: now,
    });

    await expect(db.batch([first, collision])).rejects.toThrow();

    const week = await getMyWeek(db, user, DATE);
    expect(week.length).toBe(0);
  });

  it("logging the same prayer twice keeps one row and does not double-count", async () => {
    const db = createDatabase(env.DB);
    const user = "dedup-user";
    await seedProfile(db, user);

    await logPrayer(db, user, {
      date: DATE,
      prayer: "fajr",
      status: "on_time",
    });
    await logPrayer(db, user, {
      date: DATE,
      prayer: "fajr",
      status: "on_time",
    });

    const week = await getMyWeek(db, user, DATE);
    expect(week.length).toBe(1);

    const [counter] = await db
      .select()
      .from(userAchievementCounters)
      .where(eq(userAchievementCounters.authUserId, user));
    expect(counter.onTimePrayerLogs).toBe(1);
    expect(counter.fajrOnTimePrayerLogs).toBe(1);
  });

  it("re-logging with a new status adjusts counter deltas, not row count", async () => {
    const db = createDatabase(env.DB);
    const user = "restatus-user";
    await seedProfile(db, user);

    await logPrayer(db, user, {
      date: DATE,
      prayer: "maghrib",
      status: "on_time",
    });
    await logPrayer(db, user, {
      date: DATE,
      prayer: "maghrib",
      status: "qada",
    });

    const week = await getMyWeek(db, user, DATE);
    expect(week.length).toBe(1);
    expect(week[0].status).toBe("qada");

    const [counter] = await db
      .select()
      .from(userAchievementCounters)
      .where(eq(userAchievementCounters.authUserId, user));
    expect(counter.onTimePrayerLogs).toBe(0);
    expect(counter.qadaPrayerLogs).toBe(1);
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

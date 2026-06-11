import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createDatabase } from "@/db";
// Raw import of the generated migration so the test exercises the real DDL.
import { prayerLogs, shieldSelection, users } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

describe("db schema", () => {
  it("creates all 12 app tables", async () => {
    const { results } = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"
    ).all<{ name: string }>();
    const names = results.map((r) => r.name);
    for (const table of [
      "users",
      "subscriptions",
      "polarOrders",
      "prayerTimeCaches",
      "prayerLogs",
      "shieldSelection",
      "dhikrDaily",
      "dhikrAggregate",
      "userLocations",
      "userAchievements",
      "userAchievementCounters",
      "appConfig",
    ]) {
      expect(names).toContain(table);
    }
  });

  it("registers the expected indexes", async () => {
    const { results } = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'index'"
    ).all<{ name: string }>();
    const names = results.map((r) => r.name);
    expect(names).toContain("users_by_authUserId");
    expect(names).toContain("subscriptions_by_authUserId_status");
    expect(names).toContain("prayerLogs_by_user_date_prayer");
  });

  it("round-trips a user row through drizzle", async () => {
    const db = createDatabase(env.DB);
    await db.insert(users).values({ authUserId: "u1", name: "Sana" });
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, "u1"));
    expect(row?.name).toBe("Sana");
    expect(row?.id).toBeTruthy();
  });

  it("persists json columns as parsed objects", async () => {
    const db = createDatabase(env.DB);
    await db.insert(shieldSelection).values({
      authUserId: "u2",
      windows: ["fajr", "isha"],
      androidPackageNames: ["com.example.app"],
      enabled: true,
      updatedAt: Date.now(),
    });
    const [row] = await db
      .select()
      .from(shieldSelection)
      .where(eq(shieldSelection.authUserId, "u2"));
    expect(row?.windows).toEqual(["fajr", "isha"]);
    expect(row?.androidPackageNames).toEqual(["com.example.app"]);
    expect(row?.enabled).toBe(true);
  });

  it("stores prayer log enums and nullable timestamps", async () => {
    const db = createDatabase(env.DB);
    await db.insert(prayerLogs).values({
      authUserId: "u3",
      date: "2026-06-08",
      prayer: "fajr",
      status: "on_time",
      updatedAt: Date.now(),
    });
    const [row] = await db
      .select()
      .from(prayerLogs)
      .where(eq(prayerLogs.authUserId, "u3"));
    expect(row?.prayer).toBe("fajr");
    expect(row?.status).toBe("on_time");
    expect(row?.prayedAt).toBeNull();
  });
});

import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { dhikrAggregate, userAchievements, users } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";
import {
  listForMe,
  listUnseen,
  markSeen,
  runEvaluate,
} from "./achievements.service";

applyMigrations();

const USER = "user-ach-1";

describe("achievements runEvaluate", () => {
  it("returns [] when the profile is missing (purge race guard)", async () => {
    const db = createDatabase(env.DB);
    expect(await runEvaluate(db, { authUserId: "ghost" })).toEqual([]);
  });

  it("unlocks onboarding + dhikr achievements and is idempotent", async () => {
    const db = createDatabase(env.DB);
    const now = Date.now();
    await db.insert(users).values({
      authUserId: USER,
      completedAt: new Date(now).toISOString(),
    });
    await db.insert(dhikrAggregate).values({
      authUserId: USER,
      total: 1,
      updatedAt: now,
    });

    const first = await runEvaluate(db, {
      authUserId: USER,
      today: "2026-06-08",
    });
    expect(first).toContain("first_steps");
    expect(first).toContain("first_dhikr");

    // Rows persisted.
    const rows = await db
      .select({ code: userAchievements.code })
      .from(userAchievements);
    const codes = rows.map((r) => r.code);
    expect(codes).toContain("first_steps");

    // Second run unlocks nothing new.
    const second = await runEvaluate(db, {
      authUserId: USER,
      today: "2026-06-08",
    });
    expect(second).toEqual([]);
  });
});

describe("achievements listForMe / listUnseen / markSeen", () => {
  it("listForMe returns all achievements locked for no user", async () => {
    const db = createDatabase(env.DB);
    const list = await listForMe(db, null);
    expect(list.unlockedCount).toBe(0);
    expect(list.totalCount).toBe(list.items.length);
    expect(list.items.every((i) => i.unlockedAt === null)).toBe(true);
  });

  it("listForMe reflects unlocked rows; listUnseen + markSeen flow", async () => {
    const db = createDatabase(env.DB);
    const user = "list-user";
    const now = Date.now();
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date(now).toISOString() });
    await db
      .insert(dhikrAggregate)
      .values({ authUserId: user, total: 1, updatedAt: now });
    await runEvaluate(db, { authUserId: user, today: "2026-06-08" });

    const list = await listForMe(db, user);
    expect(list.unlockedCount).toBeGreaterThan(0);
    const firstSteps = list.items.find((i) => i.code === "first_steps");
    expect(firstSteps?.unlockedAt).not.toBeNull();

    const unseen = await listUnseen(db, user);
    expect(unseen.map((u) => u.code)).toContain("first_steps");

    await markSeen(db, user, ["first_steps"]);
    const unseenAfter = await listUnseen(db, user);
    expect(unseenAfter.map((u) => u.code)).not.toContain("first_steps");
  });

  it("markSeen only stamps the listed codes and is idempotent", async () => {
    const db = createDatabase(env.DB);
    const user = "markseen-user";
    const now = Date.now();
    await db
      .insert(users)
      .values({ authUserId: user, completedAt: new Date(now).toISOString() });
    await db
      .insert(dhikrAggregate)
      .values({ authUserId: user, total: 1, updatedAt: now });
    await runEvaluate(db, { authUserId: user, today: "2026-06-08" });

    const before = await listUnseen(db, user);
    expect(before.map((u) => u.code)).toEqual(
      expect.arrayContaining(["first_steps", "first_dhikr"])
    );

    // Mark only first_steps — first_dhikr must remain unseen.
    await markSeen(db, user, ["first_steps"]);
    const after = await listUnseen(db, user);
    expect(after.map((u) => u.code)).not.toContain("first_steps");
    expect(after.map((u) => u.code)).toContain("first_dhikr");

    // Re-calling is a no-op (IS NULL guard) and doesn't resurrect anything.
    await markSeen(db, user, ["first_steps"]);
    const again = await listUnseen(db, user);
    expect(again.map((u) => u.code)).not.toContain("first_steps");
    expect(again.map((u) => u.code)).toContain("first_dhikr");

    // Empty codes is a no-op.
    await markSeen(db, user, []);
    expect((await listUnseen(db, user)).map((u) => u.code)).toContain(
      "first_dhikr"
    );
  });
});

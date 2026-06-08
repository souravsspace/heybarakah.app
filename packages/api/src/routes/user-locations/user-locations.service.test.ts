import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { users } from "@/db/schema";

import {
  create,
  listMine,
  remove,
  rename,
  setActive,
} from "./user-locations.service";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

const NYC = {
  name: "New York",
  latitude: 40.7,
  longitude: -74,
  timezone: "America/New_York",
};

async function seedProfile(db: ReturnType<typeof createDatabase>, id: string) {
  await db.insert(users).values({ authUserId: id });
}

describe("user-locations service", () => {
  beforeAll(applyMigration);

  it("creates a location and sets it active", async () => {
    const db = createDatabase(env.DB);
    const user = "loc-user";
    await seedProfile(db, user);
    const id = await create(db, user, { ...NYC, setActive: true });
    const mine = await listMine(db, user);
    expect(mine.locations).toHaveLength(1);
    expect(mine.activeId).toBe(id);
  });

  it("rejects an invalid name / coordinates / timezone", async () => {
    const db = createDatabase(env.DB);
    await expect(create(db, "x", { ...NYC, name: "  " })).rejects.toThrow(
      "Location name is required"
    );
    await expect(create(db, "x", { ...NYC, latitude: 200 })).rejects.toThrow(
      "Invalid latitude"
    );
    await expect(
      create(db, "x", { ...NYC, timezone: "Mars/Phobos" })
    ).rejects.toThrow("Invalid timezone");
  });

  it("rename/remove enforce ownership", async () => {
    const db = createDatabase(env.DB);
    const owner = "owner";
    const intruder = "intruder";
    await seedProfile(db, owner);
    const id = await create(db, owner, NYC);

    await expect(rename(db, intruder, id, "Hacked")).rejects.toThrow(
      "Location not found"
    );

    await remove(db, owner, id);
    expect((await listMine(db, owner)).locations).toHaveLength(0);
  });

  it("setActive clears the active id when passed null", async () => {
    const db = createDatabase(env.DB);
    const user = "active-user";
    await seedProfile(db, user);
    const id = await create(db, user, { ...NYC, setActive: true });
    await setActive(db, user, null);
    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, user));
    expect(profile.activePrayerLocationId).toBeNull();
    expect(id).toBeTruthy();
  });
});

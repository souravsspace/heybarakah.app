import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";

import { getAppConfig, setAppConfig } from "./app-config.service";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

describe("app-config service", () => {
  beforeAll(applyMigration);

  it("returns null when no config exists", async () => {
    const db = createDatabase(env.DB);
    expect(await getAppConfig(db)).toBeNull();
  });

  it("inserts then updates a single config row (upsert)", async () => {
    const db = createDatabase(env.DB);

    const firstId = await setAppConfig(db, {
      minSupportedVersion: "1.0.0",
      iosStoreUrl: "https://apps.apple.com/app/1",
    });
    expect(await getAppConfig(db)).toEqual({
      minSupportedVersion: "1.0.0",
      iosStoreUrl: "https://apps.apple.com/app/1",
    });

    const secondId = await setAppConfig(db, {
      minSupportedVersion: "2.0.0",
      iosStoreUrl: "https://apps.apple.com/app/2",
    });
    // Upsert keeps a single row (same id).
    expect(secondId).toBe(firstId);
    expect(await getAppConfig(db)).toEqual({
      minSupportedVersion: "2.0.0",
      iosStoreUrl: "https://apps.apple.com/app/2",
    });
  });
});

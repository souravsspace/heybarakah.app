import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { applyMigrations } from "@/test-support/apply-migrations";
import { getAppConfig, setAppConfig } from "./app-config.service";

applyMigrations();

describe("app-config service", () => {
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

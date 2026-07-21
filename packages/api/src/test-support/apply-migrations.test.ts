import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { applyMigrations } from "@/test-support/apply-migrations";

// Calling it registers a beforeAll that migrates the isolated D1 instance.
applyMigrations();

describe("applyMigrations", () => {
  it("is a callable helper", () => {
    expect(typeof applyMigrations).toBe("function");
  });

  it("has applied the schema — a migrated table is queryable", async () => {
    const db = createDatabase(env.DB);
    // Would throw "no such table" if migrations had not run.
    const rows = await db.query.user.findMany();
    expect(Array.isArray(rows)).toBe(true);
  });
});

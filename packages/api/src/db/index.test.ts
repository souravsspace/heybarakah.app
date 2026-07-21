import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

describe("createDatabase", () => {
  it("returns a drizzle client with query + insert surface", () => {
    const db = createDatabase(env.DB);
    expect(typeof db.select).toBe("function");
    expect(typeof db.insert).toBe("function");
    expect(typeof db.batch).toBe("function");
    expect(db.query).toBeDefined();
  });

  it("runs a real query against the migrated D1 instance", async () => {
    const db = createDatabase(env.DB);
    const rows = await db.query.user.findMany();
    expect(Array.isArray(rows)).toBe(true);
  });

  it("exposes the schema-typed relational query namespace", () => {
    const db = createDatabase(env.DB);
    expect(db.query.user).toBeDefined();
    expect(db.query.session).toBeDefined();
  });
});

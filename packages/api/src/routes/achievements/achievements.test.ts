import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { achievements } from "./achievements.index";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

describe("achievements routes", () => {
  beforeAll(applyMigration);

  it("listForMe returns the full locked catalogue for an anonymous user", async () => {
    const app = createTestApp(achievements);
    const res = await app.request("/achievements", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: unknown[];
      unlockedCount: number;
      totalCount: number;
    };
    expect(body.unlockedCount).toBe(0);
    expect(body.items.length).toBe(body.totalCount);
  });

  it("listUnseen returns [] for an anonymous user", async () => {
    const app = createTestApp(achievements);
    const res = await app.request("/achievements/unseen", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("requires auth to mark seen", async () => {
    const app = createTestApp(achievements);
    const res = await app.request(
      new Request("http://localhost/achievements/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: ["first_steps"] }),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });
});

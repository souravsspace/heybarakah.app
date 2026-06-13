import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { achievements } from "./achievements.index";

applyMigrations();

describe("achievements routes", () => {
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

  it("rejects a bad markSeen body with 422", async () => {
    const app = createTestApp(achievements);
    const res = await app.request(
      new Request("http://localhost/achievements/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: "x" }),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });
});

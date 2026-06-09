import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { dhikr } from "./dhikr.index";

applyMigrations();

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("dhikr routes", () => {
  it("returns defaults for an unauthenticated getToday", async () => {
    const app = createTestApp(dhikr);
    const res = await app.request("/dhikr/today?date=2026-06-08", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { count: number; target: number };
    expect(body.count).toBe(0);
    expect(body.target).toBe(33);
  });

  it("rejects an invalid date with 422", async () => {
    const app = createTestApp(dhikr);
    const res = await app.request("/dhikr/today?date=2026-02-30", {}, env);
    expect(res.status).toBe(422);
  });

  it("requires auth to increment", async () => {
    const app = createTestApp(dhikr);
    const res = await app.request(
      jsonPost("/dhikr/increment", { date: "2026-06-08", by: 1 }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("requires auth to reset", async () => {
    const app = createTestApp(dhikr);
    const res = await app.request(
      jsonPost("/dhikr/reset", { date: "2026-06-08" }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });
});

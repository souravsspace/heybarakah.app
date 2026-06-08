import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { prayerLogs } from "./prayer-logs.index";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("prayer-logs routes", () => {
  beforeAll(applyMigration);

  it("returns an empty week for an unauthenticated user", async () => {
    const app = createTestApp(prayerLogs);
    const res = await app.request(
      "/prayer-logs/week?startDate=2026-06-08",
      {},
      env
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns a zeroed streak for an unauthenticated user", async () => {
    const app = createTestApp(prayerLogs);
    const res = await app.request(
      "/prayer-logs/streak?today=2026-06-08",
      {},
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { days: number; history: number[] };
    expect(body.days).toBe(0);
    expect(body.history).toHaveLength(28);
  });

  it("requires auth to log a prayer", async () => {
    const app = createTestApp(prayerLogs);
    const res = await app.request(
      jsonPost("/prayer-logs", {
        date: "2026-06-08",
        prayer: "fajr",
        status: "on_time",
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("rejects an invalid prayer name with 422", async () => {
    const app = createTestApp(prayerLogs);
    const res = await app.request(
      jsonPost("/prayer-logs", {
        date: "2026-06-08",
        prayer: "tahajjud",
        status: "on_time",
      }),
      undefined,
      env
    );
    expect(res.status).toBe(422);
  });
});

import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { prayerTimes } from "./prayer-times.index";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

const query =
  "latitude=23.8103&longitude=90.4125&timezone=Asia/Dhaka&method=2&school=1&startDate=2026-09-09";

describe("prayer-times routes", () => {
  beforeAll(applyMigration);

  it("returns null for a cold cache read", async () => {
    const app = createTestApp(prayerTimes);
    const res = await app.request(`/prayer-times?${query}`, {}, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("null");
  });

  it("422s an unsupported method on read", async () => {
    const app = createTestApp(prayerTimes);
    const res = await app.request(
      `/prayer-times?${query.replace("method=2", "method=999")}`,
      {},
      env
    );
    expect(res.status).toBe(422);
  });

  it("requires auth to refresh", async () => {
    const app = createTestApp(prayerTimes);
    const res = await app.request(
      new Request("http://localhost/prayer-times/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: 23.8103,
          longitude: 90.4125,
          timezone: "Asia/Dhaka",
          method: 2,
          school: 1,
          startDate: "2026-09-09",
        }),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });
});

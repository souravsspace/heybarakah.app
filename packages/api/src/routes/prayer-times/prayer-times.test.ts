import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { prayerTimes } from "./prayer-times.index";

applyMigrations();

const query =
  "latitude=23.8103&longitude=90.4125&timezone=Asia/Dhaka&method=2&school=1&startDate=2026-09-09";

describe("prayer-times routes", () => {
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

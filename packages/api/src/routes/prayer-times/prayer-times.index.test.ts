import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";

import { prayerTimes } from "./prayer-times.index";

applyMigrations();

describe("prayer-times index wiring", () => {
  it("mounts the router and wires the primary route to a handler", async () => {
    const app = createTestApp(prayerTimes);
    const res = await app.request("/prayer-times", { method: "GET" }, env);
    // Route resolves to a handler (not 404) and the handler runs without
    // crashing (<500) — unauthenticated requests surface as 401/422.
    expect(res.status).not.toBe(404);
    expect(res.status).toBeLessThan(500);
  });

  it("404s an unknown path on the mounted router", async () => {
    const app = createTestApp(prayerTimes);
    const res = await app.request("/__no_such_route__", {}, env);
    expect(res.status).toBe(404);
  });
});

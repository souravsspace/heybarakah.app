import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";

import { marketing } from "./marketing.index";

applyMigrations();

describe("marketing index wiring", () => {
  it("mounts the router and wires the primary route to a handler", async () => {
    const app = createTestApp(marketing);
    const res = await app.request(
      "/marketing/waitlist",
      {
        method: "POST",
        body: "{}",
        headers: { "Content-Type": "application/json" },
      },
      env
    );
    // Route resolves to a handler (not 404) and the handler runs without
    // crashing (<500) — unauthenticated requests surface as 401/422.
    expect(res.status).not.toBe(404);
    expect(res.status).toBeLessThan(500);
  });

  it("404s an unknown path on the mounted router", async () => {
    const app = createTestApp(marketing);
    const res = await app.request("/__no_such_route__", {}, env);
    expect(res.status).toBe(404);
  });
});

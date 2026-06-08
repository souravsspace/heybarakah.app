import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { userLocations } from "./user-locations.index";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

describe("user-locations routes", () => {
  beforeAll(applyMigration);

  it("returns empty list + null active for an unauthenticated user", async () => {
    const app = createTestApp(userLocations);
    const res = await app.request("/locations", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ locations: [], activeId: null });
  });

  it("requires auth to create", async () => {
    const app = createTestApp(userLocations);
    const res = await app.request(
      new Request("http://localhost/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Mecca",
          latitude: 21.4,
          longitude: 39.8,
          timezone: "Asia/Riyadh",
        }),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });
});

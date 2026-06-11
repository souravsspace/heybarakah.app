import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { userLocations } from "./user-locations.index";

applyMigrations();

describe("user-locations routes", () => {
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

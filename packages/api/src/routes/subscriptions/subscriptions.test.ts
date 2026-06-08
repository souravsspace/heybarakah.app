import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { subscriptions } from "./subscriptions.index";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

describe("subscriptions routes", () => {
  beforeAll(applyMigration);

  it("returns null for an unauthenticated getMySubscription", async () => {
    const app = createTestApp(subscriptions);
    const res = await app.request("/subscription", {}, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("null");
  });

  it("requires auth to sync RevenueCat", async () => {
    const app = createTestApp(subscriptions);
    const res = await app.request(
      new Request("http://localhost/subscription/revenuecat", {
        method: "POST",
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("requires auth to claim polar", async () => {
    const app = createTestApp(subscriptions);
    const res = await app.request(
      new Request("http://localhost/subscription/claim-polar", {
        method: "POST",
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });
});

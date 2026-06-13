import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { subscriptions } from "./subscriptions.index";

applyMigrations();

describe("subscriptions routes", () => {
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

  it("requires auth to claim a mock subscription", async () => {
    const app = createTestApp(subscriptions);
    const res = await app.request(
      new Request("http://localhost/subscription/claim-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "yearly" }),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });
});

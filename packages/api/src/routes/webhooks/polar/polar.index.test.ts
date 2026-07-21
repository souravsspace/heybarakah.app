import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";

import { polarWebhook } from "./polar.index";

applyMigrations();

function post(secret: string | undefined) {
  const app = createApp();
  app.route("/", polarWebhook);
  return app.request(
    "/webhooks/polar",
    { method: "POST", body: JSON.stringify({ hello: "world" }) },
    { ...env, POLAR_WEBHOOK_SECRET: secret }
  );
}

describe("polarWebhook route guards", () => {
  it("returns 500 when the webhook secret is not configured", async () => {
    const res = await post(undefined);
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("not configured");
  });

  it("rejects an unsigned/forged body with 400 or 403 (not 404/500)", async () => {
    const res = await post("polar_whs_test_secret");
    expect([400, 403]).toContain(res.status);
  });
});

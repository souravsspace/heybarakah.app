import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";

import { resendWebhook } from "./resend.index";

applyMigrations();

function post(
  secret: string | undefined,
  headers: Record<string, string> = {}
) {
  const app = createApp();
  app.route("/", resendWebhook);
  return app.request(
    "/webhooks/resend",
    { method: "POST", body: "{}", headers },
    { ...env, RESEND_WEBHOOK_SECRET: secret }
  );
}

describe("resendWebhook route guards", () => {
  it("returns 500 when the webhook secret is not configured", async () => {
    const res = await post(undefined);
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("not configured");
  });

  it("returns 400 when svix signature headers are missing", async () => {
    const res = await post("whsec_test");
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("missing signature headers");
  });

  it("returns 403 when the signature does not verify", async () => {
    const res = await post("whsec_dGVzdA==", {
      "svix-id": "msg_1",
      "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
      "svix-signature": "v1,AAAA",
    });
    expect(res.status).toBe(403);
  });
});

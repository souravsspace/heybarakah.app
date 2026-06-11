import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";

import { marketing } from "./marketing.index";

function jsonPost(path: string, body: unknown, ip?: string) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ip ? { "cf-connecting-ip": ip } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("marketing routes", () => {
  it("returns ok:false for an invalid email (no Resend call)", async () => {
    const app = createTestApp(marketing);
    const res = await app.request(
      jsonPost("/marketing/waitlist", { email: "not-an-email" }),
      undefined,
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBeDefined();
  });

  it("rejects a missing body with 422", async () => {
    const app = createTestApp(marketing);
    const res = await app.request(
      jsonPost("/marketing/waitlist", {}),
      undefined,
      env
    );
    expect(res.status).toBe(422);
  });

  it("rate-limits the waitlist to 5 requests per minute per IP", async () => {
    const app = createTestApp(marketing);
    const ip = "203.0.113.7";
    // First 5 invalid-email requests are accepted by the limiter (and short-circuit
    // before any Resend call), the 6th from the same IP is rejected with 429.
    for (let i = 0; i < 5; i++) {
      const res = await app.request(
        jsonPost("/marketing/waitlist", { email: "not-an-email" }, ip),
        undefined,
        env
      );
      expect(res.status).toBe(200);
    }
    const limited = await app.request(
      jsonPost("/marketing/waitlist", { email: "not-an-email" }, ip),
      undefined,
      env
    );
    expect(limited.status).toBe(429);
  });
});

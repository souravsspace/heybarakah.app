import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";

import { marketing } from "./marketing.index";

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
});

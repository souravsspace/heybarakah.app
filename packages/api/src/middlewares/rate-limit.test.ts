import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createRouter } from "@/lib/create-router";
import { rateLimit } from "@/middlewares/rate-limit";

describe("rateLimit middleware", () => {
  it("allows up to max requests per window then returns 429", async () => {
    const app = createRouter();
    app.use("*", rateLimit({ max: 2, scope: "test", windowSeconds: 60 }));
    app.get("/y", (c) => c.json({ ok: true }));

    const headers = { "cf-connecting-ip": "1.2.3.4" };
    const first = await app.request("/y", { headers }, env);
    const second = await app.request("/y", { headers }, env);
    const third = await app.request("/y", { headers }, env);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
  });

  it("clamps the window to the KV 60s minimum", async () => {
    const app = createRouter();
    app.use("*", rateLimit({ max: 1, scope: "clamp", windowSeconds: 5 }));
    app.get("/z", (c) => c.json({ ok: true }));

    const headers = { "cf-connecting-ip": "5.6.7.8" };
    const ok = await app.request("/z", { headers }, env);
    const limited = await app.request("/z", { headers }, env);
    expect(ok.status).toBe(200);
    expect(limited.status).toBe(429);
  });
});

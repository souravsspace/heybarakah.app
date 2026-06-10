import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createRouter } from "@/lib/create-router";
import { idempotency } from "@/middlewares/idempotency";

function buildApp() {
  let calls = 0;
  const app = createRouter();
  app.use(idempotency());
  app.post("/do", (c) => {
    calls++;
    return c.json({ calls });
  });
  return { app, getCalls: () => calls };
}

function post(key?: string) {
  return new Request("http://localhost/do", {
    method: "POST",
    headers: key ? { "Idempotency-Key": key } : {},
  });
}

describe("idempotency middleware", () => {
  it("replays the first response for a repeated key without re-running the handler", async () => {
    const { app, getCalls } = buildApp();
    const first = await app.request(post("abc"), {}, env);
    const second = await app.request(post("abc"), {}, env);

    expect(await first.json()).toEqual({ calls: 1 });
    expect(await second.json()).toEqual({ calls: 1 });
    expect(second.headers.get("Idempotent-Replay")).toBe("true");
    expect(getCalls()).toBe(1);
  });

  it("runs every time when no key is supplied", async () => {
    const { app, getCalls } = buildApp();
    await app.request(post(), {}, env);
    await app.request(post(), {}, env);
    expect(getCalls()).toBe(2);
  });

  it("treats different keys independently", async () => {
    const { app, getCalls } = buildApp();
    await app.request(post("k1"), {}, env);
    await app.request(post("k2"), {}, env);
    expect(getCalls()).toBe(2);
  });

  it("does not cache non-2xx responses (transient errors stay retryable)", async () => {
    let calls = 0;
    const app = createRouter();
    app.use(idempotency());
    app.post("/fail", (c) => {
      calls++;
      return c.json({ calls }, 429);
    });
    const req = () =>
      new Request("http://localhost/fail", {
        method: "POST",
        headers: { "Idempotency-Key": "retry-me" },
      });
    const first = await app.request(req(), {}, env);
    const second = await app.request(req(), {}, env);

    expect(first.status).toBe(429);
    expect(second.status).toBe(429);
    // The 429 was not pinned to the key — the handler ran again.
    expect(second.headers.get("Idempotent-Replay")).toBeNull();
    expect(calls).toBe(2);
  });

  it("never caches auth routes (replay would drop Set-Cookie)", async () => {
    let calls = 0;
    const app = createRouter();
    app.use(idempotency());
    app.post("/api/auth/sign-in", (c) => {
      calls++;
      return c.json({ calls });
    });
    const req = () =>
      new Request("http://localhost/api/auth/sign-in", {
        method: "POST",
        headers: { "Idempotency-Key": "same" },
      });
    await app.request(req(), {}, env);
    await app.request(req(), {}, env);
    expect(calls).toBe(2);
  });
});

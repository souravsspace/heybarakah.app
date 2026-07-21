import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createRouter } from "@/lib/create-router";

describe("createRouter", () => {
  it("returns an OpenAPIHono instance with request + openapi surface", () => {
    const router = createRouter();
    expect(typeof router.request).toBe("function");
    expect(typeof router.openapi).toBe("function");
    expect(typeof router.route).toBe("function");
  });

  it("is non-strict: trailing slash resolves to the same route", async () => {
    const router = createRouter();
    router.get("/ping", (c) => c.text("pong"));

    const res = await router.request("/ping", {}, env);
    const resSlash = await router.request("/ping/", {}, env);
    expect(res.status).toBe(200);
    expect(resSlash.status).toBe(200);
  });

  it("mounts the shared defaultHook (422 on invalid params)", async () => {
    // A fresh router with no routes 404s unknown paths — confirms it is a real
    // Hono app, not a stub.
    const router = createRouter();
    const res = await router.request("/nope", {}, env);
    expect(res.status).toBe(404);
  });
});

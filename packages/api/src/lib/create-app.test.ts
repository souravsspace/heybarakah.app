import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { createRouter } from "@/lib/create-router";

function appWithPing() {
  const router = createRouter();
  router.get("/ping", (c) => c.json({ ok: true }));
  return createTestApp(router);
}

describe("createApp", () => {
  it("returns the stoker not-found shape for unknown routes", async () => {
    const app = appWithPing();
    const res = await app.request("/nope", {}, env);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { message: string };
    expect(body.message).toContain("Not Found");
  });

  it("allows the marketing web origin via CORS", async () => {
    const app = appWithPing();
    const res = await app.request(
      "/ping",
      { headers: { Origin: "https://heybarakah.app" } },
      env
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://heybarakah.app"
    );
  });

  it("rejects an unknown origin via CORS", async () => {
    const app = appWithPing();
    const res = await app.request(
      "/ping",
      { headers: { Origin: "https://evil.example" } },
      env
    );
    expect(res.headers.get("access-control-allow-origin")).not.toBe(
      "https://evil.example"
    );
  });

  it("blocks native expo origins when ALLOW_EXPO_ORIGINS is unset", async () => {
    const app = appWithPing();
    const res = await app.request(
      "/ping",
      { headers: { Origin: "barakah://" } },
      env
    );
    expect(res.headers.get("access-control-allow-origin")).not.toBe(
      "barakah://"
    );
  });
});

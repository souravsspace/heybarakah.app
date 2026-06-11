import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createRouter } from "@/lib/create-router";
import { logger } from "@/middlewares/logger";

describe("logger middleware", () => {
  it("sets x-request-id and exposes a logger on the context", async () => {
    const app = createRouter();
    app.use(logger());
    app.get("/x", (c) => {
      c.var.logger.info("hit");
      return c.json({ ok: true });
    });

    const res = await app.request("/x", {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });
});

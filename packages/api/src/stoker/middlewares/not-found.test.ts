import { env } from "cloudflare:test";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import notFound from "@/stoker/middlewares/not-found";

describe("not-found handler", () => {
  it("responds 404 with a fixed message (no path echo)", async () => {
    const app = new Hono();
    app.notFound(notFound);

    const res = await app.request("/anything?probe=1", {}, env);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe("Not Found");
    // Must not reflect caller-controlled input.
    expect(JSON.stringify(body)).not.toContain("probe");
  });
});

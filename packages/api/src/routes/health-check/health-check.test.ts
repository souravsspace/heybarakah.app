import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { healthCheck } from "./health-check.index";

describe("healthCheck route", () => {
  it("returns 200 with status OK", async () => {
    const app = createTestApp(healthCheck);
    const res = await app.request("/health", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("OK");
  });
});

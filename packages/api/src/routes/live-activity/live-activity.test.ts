import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { liveActivity } from "./live-activity.index";

applyMigrations();

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("live-activity routes", () => {
  it("requires auth to register a push-to-start token", async () => {
    const app = createTestApp(liveActivity);
    const res = await app.request(
      jsonPost("/live-activity/push-to-start-token", { token: "abc" }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("rejects an empty token", async () => {
    const app = createTestApp(liveActivity);
    const res = await app.request(
      jsonPost("/live-activity/push-to-start-token", { token: "" }),
      undefined,
      env
    );
    expect(res.status).toBe(422);
  });

  it("rejects an over-long token", async () => {
    const app = createTestApp(liveActivity);
    const res = await app.request(
      jsonPost("/live-activity/push-to-start-token", {
        token: "a".repeat(257),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(422);
  });
});

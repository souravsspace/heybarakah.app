import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import worker, { SyncHub } from "@/index";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

const ctx = {
  waitUntil: () => {
    // no-op
  },
  passThroughOnException: () => {
    // no-op
  },
} as unknown as ExecutionContext;

describe("worker entry", () => {
  it("default-exports a fetch + scheduled handler", () => {
    expect(typeof worker.fetch).toBe("function");
    expect(typeof worker.scheduled).toBe("function");
  });

  it("named-exports the SyncHub Durable Object class", () => {
    expect(typeof SyncHub).toBe("function");
  });

  it("serves the health check through the fully wired /api/v1 app", async () => {
    const res = await worker.fetch(
      new Request("https://api.test/api/v1/health"),
      env,
      ctx
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("OK");
  });

  it("404s an unknown path under the mounted app", async () => {
    const res = await worker.fetch(
      new Request("https://api.test/api/v1/__nope__"),
      env,
      ctx
    );
    expect(res.status).toBe(404);
  });

  it("rejects a /sync request without a websocket upgrade header", async () => {
    const res = await worker.fetch(
      new Request("https://api.test/api/v1/sync"),
      env,
      ctx
    );
    expect(res.status).toBe(426);
  });
});

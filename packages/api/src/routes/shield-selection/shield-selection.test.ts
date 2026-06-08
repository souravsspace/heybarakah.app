import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { shieldSelection } from "./shield-selection.index";

async function applyMigration() {
  const statements = migration0000
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("shield-selection routes", () => {
  beforeAll(applyMigration);

  it("returns null for an unauthenticated getMine", async () => {
    const app = createTestApp(shieldSelection);
    const res = await app.request("/shield", {}, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("null");
  });

  it("requires auth to set enabled", async () => {
    const app = createTestApp(shieldSelection);
    const res = await app.request(
      jsonPost("/shield/enabled", { enabled: true }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("rejects an oversized android list with 422", async () => {
    const app = createTestApp(shieldSelection);
    const res = await app.request(
      jsonPost("/shield/android", {
        androidPackageNames: Array.from({ length: 201 }, () => "a"),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(422);
  });
});

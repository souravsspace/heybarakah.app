import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { shieldSelection } from "./shield-selection.index";

applyMigrations();

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("shield-selection routes", () => {
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

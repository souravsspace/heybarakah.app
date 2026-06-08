import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { createTestApp } from "@/lib/create-app";

import { usersRouter } from "./users.index";

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

describe("users routes", () => {
  beforeAll(applyMigration);

  it("returns null for an unauthenticated getMyAccount", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request("/me", {}, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("null");
  });

  it("requires auth to update the profile", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request(
      jsonPost("/me/profile", { name: "Sana" }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("requires auth to delete the account", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request(jsonPost("/me/delete", {}), undefined, env);
    expect(res.status).toBe(401);
  });

  it("rejects an invalid profile field with 422", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request(
      jsonPost("/me/profile", { gender: "other" }),
      undefined,
      env
    );
    expect(res.status).toBe(422);
  });
});

import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import { users } from "@/db/schema";
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

  it("returns a null avatar url when unauthenticated", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request("/me/avatar", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: null });
  });

  it("requires auth to upload an avatar", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request(
      new Request("http://localhost/me/avatar", {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: new Uint8Array(8),
      }),
      undefined,
      env
    );
    expect(res.status).toBe(401);
  });

  it("404s the public avatar blob for an unknown user", async () => {
    const app = createTestApp(usersRouter);
    const res = await app.request("/avatars/ghost", {}, env);
    expect(res.status).toBe(404);
  });

  it("serves a seeded avatar blob with its content type", async () => {
    const db = createDatabase(env.DB);
    await env.R2.put("avatars/seed-user", new Uint8Array(4), {
      httpMetadata: { contentType: "image/png" },
    });
    await db.insert(users).values({
      id: crypto.randomUUID(),
      authUserId: "seed-user",
      image: "avatars/seed-user",
    });

    const app = createTestApp(usersRouter);
    const res = await app.request("/avatars/seed-user", {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
  });
});

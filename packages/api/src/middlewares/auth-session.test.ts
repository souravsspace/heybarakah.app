import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createRouter } from "@/lib/create-router";
import { authSession, requireUser } from "@/middlewares/auth-session";
import { logger } from "@/middlewares/logger";
import onError from "@/stoker/middlewares/on-error";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

function buildApp() {
  const app = createRouter();
  app.onError(onError);
  app.use(logger());
  app.use(authSession());
  app.get("/protected", (c) => c.json({ id: requireUser(c).id }));
  app.get("/whoami", (c) =>
    c.json({ user: c.get("user"), hasAuth: typeof c.get("auth") === "object" })
  );
  return app;
}

describe("authSession middleware", () => {
  it("sets auth on the context and a null user when unauthenticated", async () => {
    const app = buildApp();
    const res = await app.request("/whoami", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: unknown; hasAuth: boolean };
    expect(body.user).toBeNull();
    expect(body.hasAuth).toBe(true);
  });

  it("requireUser returns 401 for an unauthenticated request", async () => {
    const app = buildApp();
    const res = await app.request("/protected", {}, env);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe("Authentication required");
  });

  it("does not throw when an invalid bearer token is supplied", async () => {
    const app = buildApp();
    const res = await app.request(
      "/whoami",
      { headers: { Authorization: "Bearer not-a-real-token" } },
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: unknown };
    expect(body.user).toBeNull();
  });
});

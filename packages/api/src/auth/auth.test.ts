import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it, vi } from "vitest";

const { sendOTPEmailMock, captured } = vi.hoisted(() => {
  const store: { code: string | null } = { code: null };
  return {
    captured: store,
    sendOTPEmailMock: vi.fn((_env: unknown, input: { code: string }) => {
      store.code = input.code;
      return Promise.resolve();
    }),
  };
});

vi.mock("@/auth/send-otp", () => ({
  sendOTPEmail: sendOTPEmailMock,
}));

import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import migration0001 from "@/db/migrations/0001_legal_solo.sql?raw";
import { createApp } from "@/lib/create-app";

const TRUSTED_ORIGIN = "https://heybarakah.app";
const SIX_DIGIT_CODE = /^\d{6}$/;

async function applyMigrations() {
  for (const sql of [migration0000, migration0001]) {
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await env.DB.prepare(statement).run();
    }
  }
}

function jsonPost(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: TRUSTED_ORIGIN },
    body: JSON.stringify(body),
  });
}

describe("auth integration", () => {
  beforeAll(applyMigrations);

  it("returns a null session for an unauthenticated get-session", async () => {
    const app = createApp();
    const res = await app.request("/api/auth/get-session", {}, env);
    expect(res.status).toBe(200);
    const body = await res.text();
    // Better Auth returns null (as JSON) when there is no session.
    expect(body === "null" || body === "").toBe(true);
  });

  it("emails an OTP, signs in, and resolves the session via bearer token", async () => {
    const app = createApp();
    const email = "muslim@example.com";

    captured.code = null;
    const sendRes = await app.request(
      jsonPost("/api/auth/email-otp/send-verification-otp", {
        email,
        type: "sign-in",
      }),
      undefined,
      env
    );
    expect(sendRes.status).toBe(200);
    expect(sendOTPEmailMock).toHaveBeenCalled();
    expect(captured.code).toMatch(SIX_DIGIT_CODE);

    const signInRes = await app.request(
      jsonPost("/api/auth/sign-in/email-otp", {
        email,
        otp: captured.code,
      }),
      undefined,
      env
    );
    expect(signInRes.status).toBe(200);
    const signInBody = (await signInRes.json()) as {
      token?: string;
      user?: { id: string; email: string };
    };
    expect(signInBody.user?.email).toBe(email);

    // Both web and Expo replay the session cookie (the @better-auth/expo client
    // stores the Set-Cookie value and re-sends it). Resolve the session with it.
    const setCookie = signInRes.headers.get("set-cookie") ?? "";
    const cookie = setCookie.split(";")[0];
    expect(cookie).toContain("better-auth.session_token=");

    const sessionRes = await app.request(
      "/api/auth/get-session",
      { headers: { Cookie: cookie } },
      env
    );
    expect(sessionRes.status).toBe(200);
    const sessionBody = (await sessionRes.json()) as {
      user: { id: string; email: string };
    } | null;
    expect(sessionBody?.user.email).toBe(email);
    // authUserId continuity: the resolved id equals the sign-in user id.
    expect(sessionBody?.user.id).toBe(signInBody.user?.id);
  });
});

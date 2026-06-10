import { describe, expect, it } from "vitest";

import { auth, createAuth } from "@/auth";

const runtimeEnv = {
  DB: {} as never,
  KV: {} as never,
  R2: {} as never,
  BETTER_AUTH_SECRET: "test-better-auth-secret-0123456789ab",
  BETTER_AUTH_URL: "http://localhost:8787",
  SITE_URL: "https://heybarakah.app",
  NATIVE_APP_URL: "barakah://",
  GOOGLE_CLIENT_ID: "g-id",
  GOOGLE_CLIENT_SECRET: "g-secret",
  APPLE_CLIENT_ID: "com.souravsspace.Barakah.signin",
  APPLE_APP_BUNDLE_IDENTIFIER: "com.souravsspace.Barakah",
  APPLE_CLIENT_SECRET: "a-secret",
  ALLOW_EXPO_ORIGINS: "true",
} as Parameters<typeof createAuth>[0];

describe("createAuth config", () => {
  it("builds the CLI schema-gen instance without env", () => {
    expect(typeof auth.handler).toBe("function");
    expect(auth.api).toBeDefined();
  });

  it("registers email-otp and expo plugins, disables email/password", () => {
    const ids = auth.options.plugins?.map((p) => p.id) ?? [];
    expect(ids).toContain("email-otp");
    expect(ids).toContain("expo");
    expect(auth.options.emailAndPassword?.enabled).toBe(false);
    expect(auth.options.user?.deleteUser?.enabled).toBe(true);
  });

  it("omits anonymous and email-password plugins", () => {
    const ids = auth.options.plugins?.map((p) => p.id) ?? [];
    expect(ids).not.toContain("anonymous");
  });

  it("rate-limits the OTP send endpoint tighter than the global budget", () => {
    const rules = auth.options.rateLimit?.customRules ?? {};
    const otpRule = rules["/email-otp/send-verification-otp"];
    expect(otpRule).toBeDefined();
    expect(otpRule).toMatchObject({ window: 60, max: 5 });
    // Stricter than the global per-window max so a victim address can't be flooded.
    expect((otpRule as { max: number }).max).toBeLessThan(
      auth.options.rateLimit?.max ?? Number.POSITIVE_INFINITY
    );
  });

  it("wires social providers and trusted origins from runtime env", () => {
    const runtime = createAuth(runtimeEnv, undefined, "http://localhost:8787");
    expect(runtime.options.socialProviders?.google?.clientId).toBe("g-id");
    expect(runtime.options.socialProviders?.apple?.clientId).toBe(
      "com.souravsspace.Barakah.signin"
    );
    const origins = runtime.options.trustedOrigins ?? [];
    expect(origins).toContain("https://heybarakah.app");
    expect(origins).toContain("barakah://");
    expect(origins).toContain("https://appleid.apple.com");
    // ALLOW_EXPO_ORIGINS=true opens the Expo Go schemes.
    expect(origins).toContain("exp://*");
  });

  it("keeps exp:// origins closed when the gate is off", () => {
    const runtime = createAuth(
      { ...runtimeEnv, ALLOW_EXPO_ORIGINS: undefined } as Parameters<
        typeof createAuth
      >[0],
      undefined,
      "http://localhost:8787"
    );
    const origins = runtime.options.trustedOrigins ?? [];
    expect(origins).not.toContain("exp://*");
  });
});

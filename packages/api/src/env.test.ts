import { describe, expect, it } from "vitest";

import { isTruthyFlag, parseEnv } from "@/env";

const VALID = {
  BETTER_AUTH_SECRET: "secret",
  BETTER_AUTH_URL: "https://api.heybarakah.app",
  SITE_URL: "https://heybarakah.app",
  NATIVE_APP_URL: "barakah://",
};

const MISSING_SECRET_RE = /BETTER_AUTH_SECRET/;
const BAD_URL_RE = /BETTER_AUTH_URL/;

describe("parseEnv", () => {
  it("returns parsed vars when required keys are present", () => {
    const env = parseEnv(VALID);
    expect(env.BETTER_AUTH_SECRET).toBe("secret");
    expect(env.SITE_URL).toBe("https://heybarakah.app");
  });

  it("leaves optional integration secrets undefined", () => {
    const env = parseEnv(VALID);
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.POLAR_WEBHOOK_SECRET).toBeUndefined();
  });

  it("throws listing the missing required key", () => {
    const { BETTER_AUTH_SECRET, ...rest } = VALID;
    expect(() => parseEnv(rest)).toThrowError(MISSING_SECRET_RE);
  });

  it("rejects a non-url BETTER_AUTH_URL", () => {
    expect(() =>
      parseEnv({ ...VALID, BETTER_AUTH_URL: "not-a-url" })
    ).toThrowError(BAD_URL_RE);
  });
});

describe("isTruthyFlag", () => {
  it("treats 'true' and '1' as enabled", () => {
    expect(isTruthyFlag("true")).toBe(true);
    expect(isTruthyFlag("1")).toBe(true);
  });

  it("treats undefined and other values as disabled", () => {
    expect(isTruthyFlag(undefined)).toBe(false);
    expect(isTruthyFlag("false")).toBe(false);
    expect(isTruthyFlag("")).toBe(false);
  });
});

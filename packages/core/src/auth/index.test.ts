import { describe, expect, test } from "bun:test";

import * as auth from "./index";

describe("auth barrel", () => {
  test("re-exports the OTP email builder", () => {
    expect(typeof auth.buildOTPVerificationEmail).toBe("function");
  });
});

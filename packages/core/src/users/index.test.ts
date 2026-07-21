import { describe, expect, test } from "bun:test";

import * as users from "./index";

describe("users barrel", () => {
  test("re-exports validateProfileInput", () => {
    expect(typeof users.validateProfileInput).toBe("function");
  });

  test("re-exports length constants", () => {
    expect(users.PROFILE_NAME_MAX_LENGTH).toBe(120);
    expect(users.PROFILE_COMPLETED_AT_MAX_LENGTH).toBe(64);
  });
});

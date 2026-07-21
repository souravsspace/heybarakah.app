import { describe, expect, test } from "bun:test";

import {
  PROFILE_COMPLETED_AT_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  validateProfileInput,
} from "./validators";

describe("validateProfileInput — name", () => {
  test("accepts a normal name", () => {
    expect(() => validateProfileInput({ name: "Aisha" })).not.toThrow();
  });

  test("accepts a name at the max length", () => {
    expect(() =>
      validateProfileInput({ name: "a".repeat(PROFILE_NAME_MAX_LENGTH) })
    ).not.toThrow();
  });

  test("rejects a name over the max length", () => {
    expect(() =>
      validateProfileInput({ name: "a".repeat(PROFILE_NAME_MAX_LENGTH + 1) })
    ).toThrow("exceeds");
  });

  test("rejects C0 control characters", () => {
    expect(() => validateProfileInput({ name: "badname" })).toThrow(
      "invalid characters"
    );
  });

  test("rejects the DEL character", () => {
    expect(() => validateProfileInput({ name: "badname" })).toThrow(
      "invalid characters"
    );
  });

  test("allows unicode letters and emoji above the control range", () => {
    expect(() => validateProfileInput({ name: "Aï café 🌙" })).not.toThrow();
  });

  test("undefined name is a no-op", () => {
    expect(() => validateProfileInput({})).not.toThrow();
  });
});

describe("validateProfileInput — completedAt", () => {
  test("accepts a valid ISO timestamp", () => {
    expect(() =>
      validateProfileInput({ completedAt: "2026-03-01T00:00:00.000Z" })
    ).not.toThrow();
  });

  test("rejects an unparseable date", () => {
    expect(() => validateProfileInput({ completedAt: "not-a-date" })).toThrow(
      "not a valid date"
    );
  });

  test("rejects a completedAt over the max length", () => {
    expect(() =>
      validateProfileInput({
        completedAt: "2".repeat(PROFILE_COMPLETED_AT_MAX_LENGTH + 1),
      })
    ).toThrow("exceeds");
  });

  test("undefined completedAt is a no-op", () => {
    expect(() => validateProfileInput({ name: "ok" })).not.toThrow();
  });
});

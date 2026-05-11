import { describe, expect, test } from "bun:test";
import { parseWaitlistEmail } from "./waitlist";

describe("parseWaitlistEmail", () => {
  test("normalizes valid emails (trim + lowercase)", () => {
    const result = parseWaitlistEmail("  Hello@Example.COM  ");
    expect(result).toEqual({ ok: true, email: "hello@example.com" });
  });

  test("accepts valid email", () => {
    const result = parseWaitlistEmail("user@gmail.com");
    expect(result).toEqual({ ok: true, email: "user@gmail.com" });
  });

  test("rejects invalid email format", () => {
    const result = parseWaitlistEmail("not-an-email");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid email.");
    }
  });

  test("rejects email that is too short", () => {
    const result = parseWaitlistEmail("a@b");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("5");
    }
  });

  test("rejects email that is too long", () => {
    const longEmail = `${"a".repeat(250)}@example.com`;
    const result = parseWaitlistEmail(longEmail);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("254");
    }
  });

  test("rejects disposable email domains", () => {
    const result = parseWaitlistEmail("user@10minutemail.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Please use a non-disposable email.");
    }
  });

  test("rejects another disposable email domain", () => {
    const result = parseWaitlistEmail("test@mailinator.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Please use a non-disposable email.");
    }
  });

  test("rejects empty string", () => {
    const result = parseWaitlistEmail("");
    expect(result.ok).toBe(false);
  });

  test("rejects non-string input", () => {
    const result = parseWaitlistEmail(123);
    expect(result.ok).toBe(false);
  });
});

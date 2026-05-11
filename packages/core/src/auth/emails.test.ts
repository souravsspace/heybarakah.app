import { describe, expect, test } from "bun:test";
import { buildOTPVerificationEmail } from "./emails";

describe("OTP verification email", () => {
  test("builds resend payload from the mails template", async () => {
    const email = await buildOTPVerificationEmail({ code: "123456" });

    expect(email.subject).toBe("Your Barakah verification code");
    expect(email.html).toContain("Verify your Barakah account");
    expect(email.html).toContain("123456");
    expect(email.text).toContain("1 2 3 4 5 6");
  });
});

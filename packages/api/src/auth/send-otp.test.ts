import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock, resendCtor } = vi.hoisted(() => {
  const send = vi.fn();
  return {
    sendMock: send,
    resendCtor: vi.fn(),
  };
});

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
    constructor(apiKey: string) {
      resendCtor(apiKey);
    }
  },
}));

import { sendOTPEmail } from "@/auth/send-otp";

const baseEnv = {
  RESEND_API_KEY: "re_test_key",
  RESEND_AUTH_EMAIL: "Barakah <no-reply@heybarakah.app>",
  RESEND_REPLY_TO: "hello@heybarakah.app",
} as Parameters<typeof sendOTPEmail>[0];

describe("sendOTPEmail", () => {
  beforeEach(() => {
    sendMock.mockReset();
    resendCtor.mockClear();
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  });

  it("sends the OTP email via Resend with from/replyTo and the code embedded", async () => {
    await sendOTPEmail(baseEnv, { to: "user@example.com", code: "123456" });

    expect(resendCtor).toHaveBeenCalledWith("re_test_key");
    expect(sendMock).toHaveBeenCalledTimes(1);
    const payload = sendMock.mock.calls[0]?.[0] as Record<string, string>;
    expect(payload.from).toBe("Barakah <no-reply@heybarakah.app>");
    expect(payload.to).toBe("user@example.com");
    expect(payload.replyTo).toBe("hello@heybarakah.app");
    expect(payload.subject).toContain("sign-in code");
    expect(payload.html).toContain("123456");
    expect(payload.text).toContain("123456");
  });

  it("omits replyTo when unset", async () => {
    await sendOTPEmail(
      { ...baseEnv, RESEND_REPLY_TO: undefined },
      { to: "user@example.com", code: "123456" }
    );

    const payload = sendMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.replyTo).toBeUndefined();
  });

  it("throws when Resend is not configured", async () => {
    await expect(
      sendOTPEmail(
        { ...baseEnv, RESEND_API_KEY: undefined },
        { to: "user@example.com", code: "123456" }
      )
    ).rejects.toThrow("Resend is not configured");
  });

  it("throws when Resend returns an error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "bad key" } });
    await expect(
      sendOTPEmail(baseEnv, { to: "user@example.com", code: "123456" })
    ).rejects.toThrow("Resend send failed: bad key");
  });
});

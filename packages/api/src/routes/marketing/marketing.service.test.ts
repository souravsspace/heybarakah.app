import { beforeEach, describe, expect, it, vi } from "vitest";

const { contactsCreate, emailsSend } = vi.hoisted(() => ({
  contactsCreate: vi.fn(),
  emailsSend: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    contacts = { create: contactsCreate };
    emails = { send: emailsSend };
  },
}));

import { joinWaitlist, parseWaitlistEmail } from "./marketing.service";

const env = {
  RESEND_API_KEY: "re_test",
  RESEND_AUDIENCE_ID: "aud_1",
  RESEND_FROM: "Barakah <salam@heybarakah.app>",
  RESEND_REPLY_TO: "hello@heybarakah.app",
} as Parameters<typeof joinWaitlist>[0];

describe("parseWaitlistEmail", () => {
  it("accepts a normal email (trimmed + lowercased)", () => {
    expect(parseWaitlistEmail("  User@Example.COM ")).toEqual({
      ok: true,
      email: "user@example.com",
    });
  });

  it("rejects an invalid email", () => {
    expect(parseWaitlistEmail("nope").ok).toBe(false);
  });

  it("rejects a disposable domain", () => {
    const result = parseWaitlistEmail("a@mailinator.com");
    expect(result).toEqual({
      ok: false,
      error: "Please use a non-disposable email.",
    });
  });
});

describe("joinWaitlist", () => {
  beforeEach(() => {
    contactsCreate.mockReset();
    emailsSend.mockReset();
    contactsCreate.mockResolvedValue({ data: { id: "c1" }, error: null });
    emailsSend.mockResolvedValue({ data: { id: "e1" }, error: null });
  });

  it("adds a contact and sends the welcome email", async () => {
    const result = await joinWaitlist(env, "new@example.com");
    expect(result).toEqual({ ok: true });
    expect(contactsCreate).toHaveBeenCalledWith({
      audienceId: "aud_1",
      email: "new@example.com",
      unsubscribed: false,
    });
    expect(emailsSend).toHaveBeenCalled();
  });

  it("returns the validation error without calling Resend", async () => {
    const result = await joinWaitlist(env, "bad");
    expect(result.ok).toBe(false);
    expect(contactsCreate).not.toHaveBeenCalled();
  });

  it("warns when the email send fails but the contact saved", async () => {
    emailsSend.mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await joinWaitlist(env, "new@example.com");
    expect(result.ok).toBe(true);
    expect(result.warning).toBeDefined();
  });
});

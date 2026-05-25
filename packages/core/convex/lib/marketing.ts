"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { parseWaitlistEmail, welcomeEmail } from "../../src/marketing";
import { action } from "../_generated/server";
import { requireEnv } from "./env";

export const joinWaitlist = action({
  args: { email: v.string() },
  returns: v.object({
    ok: v.boolean(),
    error: v.optional(v.string()),
    warning: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    const parsed = parseWaitlistEmail(args.email);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }

    const resend = new Resend(requireEnv("RESEND_API_KEY"));

    const contact = await resend.contacts.create({
      audienceId: requireEnv("RESEND_AUDIENCE_ID"),
      email: parsed.email,
      unsubscribed: false,
    });

    if (contact.error) {
      if (contact.error.name === "validation_error") {
        return { ok: true };
      }
      console.error("[waitlist] contacts.create error", contact.error);
      return { ok: false, error: "Could not save your email." };
    }

    const { subject, text, html } = await welcomeEmail();
    const send = await resend.emails.send({
      from: requireEnv("RESEND_FROM"),
      to: parsed.email,
      subject,
      text,
      html,
      replyTo: requireEnv("RESEND_REPLY_TO"),
    });

    if (send.error) {
      console.error("[waitlist] emails.send error", send.error);
      return { ok: true, warning: "Saved, but confirmation email failed." };
    }

    return { ok: true };
  },
});

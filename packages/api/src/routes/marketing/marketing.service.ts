import disposableDomains from "disposable-email-domains";
import { Resend } from "resend";
import { z } from "zod";

import type { EnvVars } from "@/env";

const disposableSet = new Set(disposableDomains);

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5)
    .max(254)
    .email("Invalid email."),
});

/**
 * Reimplements core `src/marketing/waitlist.ts#parseWaitlistEmail`. Copied (not
 * imported) because `@barakah/core/marketing` re-exports a react-email template
 * that can't compile/bundle under the Worker's `jsxImportSource: hono/jsx`.
 */
export function parseWaitlistEmail(
  input: unknown
): { ok: true; email: string } | { ok: false; error: string } {
  const parsed = emailSchema.safeParse({ email: input });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Invalid email." };
  }
  const email = parsed.data.email;
  const domain = email.split("@")[1];
  if (!domain || disposableSet.has(domain)) {
    return { ok: false, error: "Please use a non-disposable email." };
  }
  return { ok: true, email };
}

function buildWelcomeEmail(): { subject: string; text: string; html: string } {
  const subject = "You're on the list";
  const text =
    "Thank you for joining the Barakah waitlist. We'll let you know the moment early access opens, inshaAllAh.";
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
          <tr><td style="font-size:18px;font-weight:700;color:#29603E;">You're on the list</td></tr>
          <tr><td style="padding-top:16px;font-size:14px;line-height:1.6;color:#374151;">Thank you for joining the Barakah waitlist. We'll let you know the moment early access opens, inshaAllAh.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  return { subject, text, html };
}

export interface JoinWaitlistResult {
  error?: string;
  ok: boolean;
  warning?: string;
}

/** Ports convex/lib/marketing.ts `joinWaitlist`: validate → add contact → email. */
export async function joinWaitlist(
  env: EnvVars,
  rawEmail: unknown
): Promise<JoinWaitlistResult> {
  const parsed = parseWaitlistEmail(rawEmail);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const apiKey = env.RESEND_API_KEY;
  const audienceId = env.RESEND_AUDIENCE_ID;
  const from = env.RESEND_FROM;
  if (!(apiKey && audienceId && from)) {
    return { ok: false, error: "Waitlist is not configured." };
  }

  const resend = new Resend(apiKey);
  const contact = await resend.contacts.create({
    audienceId,
    email: parsed.email,
    unsubscribed: false,
  });
  if (contact.error) {
    if (contact.error.name === "validation_error") {
      return { ok: false, error: "That email address is not valid." };
    }
    return { ok: false, error: "Could not save your email." };
  }

  const { subject, text, html } = buildWelcomeEmail();
  const send = await resend.emails.send({
    from,
    to: parsed.email,
    subject,
    text,
    html,
    ...(env.RESEND_REPLY_TO ? { replyTo: env.RESEND_REPLY_TO } : {}),
  });
  if (send.error) {
    return { ok: true, warning: "Saved, but confirmation email failed." };
  }
  return { ok: true };
}

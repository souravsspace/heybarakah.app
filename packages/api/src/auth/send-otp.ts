import { Resend } from "resend";

import type { EnvVars } from "@/env";
import { escapeHtml } from "@/lib/html";

interface SendOTPInput {
  code: string;
  to: string;
}

const ACCENT = "#29603E";

/**
 * Render the sign-in OTP email inline (brand colors, no emoji, sentence case).
 *
 * The Convex backend reused the `@barakah/mails` react-email template via
 * `@barakah/core/auth`. That template can't be reused here: the Worker tsconfig
 * pins `jsxImportSource: hono/jsx`, which conflicts with react-email's React
 * JSX, and rendering react-dom/server at runtime would bloat the Worker bundle
 * (a flagged migration risk). A plain code email needs neither.
 */
function buildOTPEmail(code: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Your Barakah sign-in code";
  const text = `Your Barakah sign-in code is ${code}. It expires shortly. If you didn't request this, you can ignore this email.`;
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <tr><td style="font-size:16px;line-height:1.5;color:#111111;">Your sign-in code</td></tr>
            <tr><td style="padding:24px 0;font-size:36px;font-weight:700;letter-spacing:8px;color:${ACCENT};">${escapeHtml(code)}</td></tr>
            <tr><td style="font-size:14px;line-height:1.5;color:#6b7280;">This code expires shortly. If you didn't request it, you can safely ignore this email.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { subject, html, text };
}

/**
 * Send a sign-in OTP email via the Resend SDK. Replaces the Convex
 * `@convex-dev/resend` flow (`convex/lib/resend.ts#sendOTPVerification`) with a
 * plain SDK call that runs on workerd.
 */
export async function sendOTPEmail(
  env: EnvVars,
  { to, code }: SendOTPInput
): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_AUTH_EMAIL;
  if (!(apiKey && from)) {
    throw new Error(
      "Resend is not configured: RESEND_API_KEY and RESEND_AUTH_EMAIL are required"
    );
  }

  const { html, subject, text } = buildOTPEmail(code);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
    ...(env.RESEND_REPLY_TO ? { replyTo: env.RESEND_REPLY_TO } : {}),
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

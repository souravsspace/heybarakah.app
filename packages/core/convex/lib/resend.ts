import { buildOTPVerificationEmail } from "@barakah/core/auth";
import { Resend } from "@convex-dev/resend";
import { components } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { requireEnv } from "./env";

export const resendHandler = new Resend(components.resend, {
  testMode: false,
});

export const sendEmail = async (
  ctx: ActionCtx,
  {
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }
) => {
  try {
    await resendHandler.sendEmail(ctx, {
      from: requireEnv("RESEND_AUTH_EMAIL"),
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("[resend] sendEmail failed", {
      to,
      subject,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
};

export const sendOTPVerification = async (
  ctx: ActionCtx,
  { to, code }: { to: string; code: string }
) => {
  const { html, subject, text } = await buildOTPVerificationEmail({ code });
  await sendEmail(ctx, { to, subject, html, text });
};

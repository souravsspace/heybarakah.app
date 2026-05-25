import { buildOTPVerificationEmail } from "@barakah/core/auth";
import { Resend, vOnEmailEventArgs } from "@convex-dev/resend";
import { components, internal } from "../_generated/api";
import { type ActionCtx, internalMutation } from "../_generated/server";
import { requireEnv } from "./env";

requireEnv("RESEND_WEBHOOK_SECRET");

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: (_ctx, { id, event }) => {
    console.warn("[resend] event", {
      id,
      type: event.type,
      data: event.data,
    });
    return Promise.resolve();
  },
});

export const resendHandler: Resend = new Resend(components.resend, {
  testMode: false,
  onEmailEvent: internal.lib.resend.handleEmailEvent,
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
    const emailId = await resendHandler.sendEmail(ctx, {
      from: requireEnv("RESEND_AUTH_EMAIL"),
      to,
      subject,
      html,
      text,
    });
    console.warn("[resend] enqueued", { to, subject, emailId });
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

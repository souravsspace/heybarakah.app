import { renderVerifyOtpEmail } from "@barakah/mails/emails/verify-otp";
import type { ActionCtx } from "../../_generated/server";
import { sendEmail } from "./sendEmails";

export const buildOTPVerificationEmail = async ({ code }: { code: string }) =>
  renderVerifyOtpEmail({ code });

export const sendOTPVerification = async (
  ctx: ActionCtx,
  {
    to,
    code,
  }: {
    to: string;
    code: string;
  }
) => {
  const { html, subject, text } = await buildOTPVerificationEmail({ code });
  await sendEmail(ctx, {
    to,
    subject,
    html,
    text,
  });
};

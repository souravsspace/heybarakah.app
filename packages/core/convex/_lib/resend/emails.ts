import type { ActionCtx } from "../../_generated/server";
import generateVerifyOTP from "./emails/verifyOTP";
import { sendEmail } from "./sendEmails";

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
  const { html, text } = generateVerifyOTP({ code });
  await sendEmail(ctx, {
    to,
    subject: "Your Barakah verification code",
    html,
    text,
  });
};

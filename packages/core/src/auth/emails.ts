import { renderVerifyOtpEmail } from "@barakah/mails/emails/verify-otp";

export const buildOTPVerificationEmail = async ({ code }: { code: string }) =>
  renderVerifyOtpEmail({ code });

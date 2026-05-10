export default function generateVerifyOTP({ code }: { code: string }): {
  html: string;
  text: string;
} {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #29603E; font-size: 22px; margin-bottom: 16px;">Verify your Barakah account</h1>
      <p style="color: #0F1311; font-size: 15px; line-height: 22px;">
        Enter this verification code to sign in:
      </p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0F1311; padding: 16px 0;">${code}</div>
      <p style="color: #6B7280; font-size: 13px; line-height: 20px;">
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `Verify your Barakah account\n\nEnter this verification code to sign in:\n\n${code}\n\nIf you did not request this code, you can safely ignore this email.`;

  return { html, text };
}

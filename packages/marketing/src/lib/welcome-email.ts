export function welcomeEmail() {
  const subject = "You're on the Barakah waitlist";

  const text = `Bismillah ir-Rahman ir-Raheem.

You're on the list. We'll send one quiet email when early access opens — nothing else.

Barakah is a calm companion for salah. Five times a day, your phone steps aside so you can show up — not scroll.

Wa salaam,
The Barakah team
heybarakah.app`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F7F6F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#171513;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E8E5DD;border-radius:4px;padding:40px;">
            <tr>
              <td style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#29603E;font-weight:700;">
                Barakah
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;font-family:'Libre Baskerville',Georgia,serif;font-size:24px;line-height:1.3;color:#171513;">
                You're on the list.
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px;font-size:15px;line-height:1.6;color:#3a3733;">
                Bismillah ir-Rahman ir-Raheem.
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3a3733;">
                We'll send one quiet email when early access opens — nothing else.
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3a3733;">
                Barakah is a calm companion for salah. Five times a day, your phone steps aside so you can show up — not scroll.
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px;border-top:1px solid #E8E5DD;margin-top:32px;font-size:13px;color:#7a766f;line-height:1.6;">
                Wa salaam,<br/>The Barakah team
              </td>
            </tr>
          </table>
          <div style="max-width:520px;padding-top:16px;font-size:11px;color:#9a958d;text-align:center;">
            heybarakah.app
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

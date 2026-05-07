function formatMoney(minorUnits: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(minorUnits / 100);
  } catch {
    return `${(minorUnits / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function purchaseEmail({
  name,
  totalAmount,
  currency,
  invoiceNumber,
}: {
  name?: string | null;
  totalAmount: number;
  currency: string;
  invoiceNumber?: string | null;
}) {
  const greeting = name
    ? `As-salaamu alaykum, ${name}.`
    : "As-salaamu alaykum.";
  const total = formatMoney(totalAmount, currency);
  const subject = "Your Barakah lifetime is confirmed";

  const receiptLines = [
    `Total: ${total}`,
    invoiceNumber ? `Invoice: ${invoiceNumber}` : null,
  ].filter(Boolean);

  const text = `${greeting}

Bismillah ir-Rahman ir-Raheem.

Your lifetime access to Barakah is confirmed. Jazak Allahu khayran for supporting the work.

${receiptLines.join("\n")}

We'll email you the moment early access opens. One quiet email — nothing else.

Wa salaam,
The Barakah team
heybarakah.app`;

  const receiptHtml = `
    <tr>
      <td style="padding-top:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;border:1px solid #E8E5DD;border-radius:4px;padding:16px 20px;">
          <tr>
            <td style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7a766f;font-weight:700;">Total</td>
            <td align="right" style="font-size:15px;color:#171513;font-weight:600;">${total}</td>
          </tr>
          ${
            invoiceNumber
              ? `<tr>
            <td style="padding-top:8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7a766f;font-weight:700;">Invoice</td>
            <td align="right" style="padding-top:8px;font-size:13px;color:#3a3733;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${invoiceNumber}</td>
          </tr>`
              : ""
          }
        </table>
      </td>
    </tr>`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F7F6F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#171513;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E8E5DD;border-radius:4px;padding:40px;">
            <tr>
              <td style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#29603E;font-weight:700;">
                Barakah — Lifetime
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;font-family:'Libre Baskerville',Georgia,serif;font-size:24px;line-height:1.3;color:#171513;">
                Your lifetime is confirmed.
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px;font-size:15px;line-height:1.6;color:#3a3733;">
                ${greeting}
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3a3733;">
                Bismillah ir-Rahman ir-Raheem.
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3a3733;">
                Lifetime access to Barakah secured. Jazak Allahu khayran for supporting the work.
              </td>
            </tr>
            ${receiptHtml}
            <tr>
              <td style="padding-top:24px;font-size:15px;line-height:1.6;color:#3a3733;">
                We'll email you the moment early access opens. One quiet email — nothing else.
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px;border-top:1px solid #E8E5DD;font-size:13px;color:#7a766f;line-height:1.6;">
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

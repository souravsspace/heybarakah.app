import { renderPurchaseEmail } from "@barakah/mails/emails/purchase";
import { renderWaitlistEmail } from "@barakah/mails/emails/waitlist";

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

export async function welcomeEmail() {
  return await renderWaitlistEmail();
}

export async function purchaseEmail({
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
  const total = formatMoney(totalAmount, currency);
  return await renderPurchaseEmail({
    name,
    total,
    invoiceNumber,
  });
}

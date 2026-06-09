import { eq, type SQL, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import type { Database } from "@/db";
import { polarOrders, subscriptions } from "@/db/schema";
import { escapeHtml } from "@/lib/html";

export interface PaidOrderInput {
  authUserId?: string;
  currency: string;
  customerEmail: string;
  customerName?: string;
  invoiceNumber?: string;
  polarCustomerId?: string;
  polarOrderId: string;
  productId?: string;
  raw?: unknown;
  totalAmount: number;
}

/**
 * Idempotently record a paid Polar order and activate the matching subscription.
 * Ported from convex `recordPaidOrder`. The order upsert on UNIQUE polarOrderId
 * makes a webhook retry a no-op (Polar redelivers), and a paid order always wins
 * source precedence (source=polar, productId=lifetime) — RevenueCat must never
 * overwrite it. Receipt-email idempotency is the caller's enqueue dedupeKey.
 */
export async function recordPaidOrder(
  db: Database,
  args: PaidOrderInput
): Promise<void> {
  const now = new Date().toISOString();

  // Upsert on UNIQUE(polarOrderId): a racing webhook retry resolves to an update
  // instead of inserting a duplicate order row. On conflict, keep an
  // already-linked authUserId when this delivery doesn't carry one.
  const orderWrite: BatchItem<"sqlite"> = db
    .insert(polarOrders)
    .values({
      id: crypto.randomUUID(),
      authUserId: args.authUserId ?? null,
      polarOrderId: args.polarOrderId,
      polarCustomerId: args.polarCustomerId ?? null,
      customerEmail: args.customerEmail,
      customerName: args.customerName ?? null,
      productId: args.productId ?? null,
      totalAmount: args.totalAmount,
      currency: args.currency,
      invoiceNumber: args.invoiceNumber ?? null,
      eventType: "order.paid",
      receivedAt: now,
      raw: args.raw ?? null,
    })
    .onConflictDoUpdate({
      target: polarOrders.polarOrderId,
      set: {
        authUserId: args.authUserId ?? sql`${polarOrders.authUserId}`,
        polarCustomerId: args.polarCustomerId ?? null,
        customerEmail: args.customerEmail,
        customerName: args.customerName ?? null,
        productId: args.productId ?? null,
        totalAmount: args.totalAmount,
        currency: args.currency,
        invoiceNumber: args.invoiceNumber ?? null,
        receivedAt: now,
        raw: args.raw ?? null,
      },
    });

  // Order + subscription activation must be atomic (D1 has no interactive txn).
  // Reads happen first; the writes are built (not run) and batched together.
  const existing = await resolveExistingPolarSub(db, args);
  const subWrite = buildPolarSubscriptionWrite(db, args, now, existing);
  await db.batch([orderWrite, subWrite]);
}

// Resolve the target subscription in precedence order; keying on the order id
// first closes the concurrent-retry window (mirrors the convex guard).
async function resolveExistingPolarSub(db: Database, args: PaidOrderInput) {
  return (
    (await findSub(db, eq(subscriptions.polarOrderId, args.polarOrderId))) ??
    (args.authUserId
      ? await findSub(db, eq(subscriptions.authUserId, args.authUserId))
      : null) ??
    (args.polarCustomerId
      ? await findSub(
          db,
          eq(subscriptions.polarCustomerId, args.polarCustomerId)
        )
      : null) ??
    (await findSub(db, eq(subscriptions.customerEmail, args.customerEmail)))
  );
}

function buildPolarSubscriptionWrite(
  db: Database,
  args: PaidOrderInput,
  now: string,
  existing: Awaited<ReturnType<typeof resolveExistingPolarSub>>
) {
  const activation = {
    status: "active" as const,
    productId: "lifetime" as const,
    source: "polar" as const,
    polarCustomerId: args.polarCustomerId ?? null,
    polarProductId: args.productId ?? null,
    polarOrderId: args.polarOrderId,
    activatedAt: now,
    updatedAt: now,
  };

  if (existing) {
    return db
      .update(subscriptions)
      .set({
        authUserId: args.authUserId ?? existing.authUserId,
        ...activation,
      })
      .where(eq(subscriptions.id, existing.id));
  }

  return db.insert(subscriptions).values({
    id: crypto.randomUUID(),
    authUserId: args.authUserId ?? null,
    customerEmail: args.customerEmail,
    ...activation,
  });
}

function findSub(db: Database, where: SQL) {
  return db
    .select()
    .from(subscriptions)
    .where(where)
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

const CENTS_PER_UNIT = 100;

/** Inline purchase receipt (no react-email at runtime — see §4 send-otp note). */
export function buildPurchaseEmail(order: {
  name: string | null;
  totalAmount: number;
  currency: string;
  invoiceNumber: string | null;
}): { subject: string; html: string; text: string } {
  const amount = (order.totalAmount / CENTS_PER_UNIT).toFixed(2);
  const currency = order.currency.toUpperCase();
  const greeting = order.name
    ? `Assalamu alaikum ${order.name},`
    : "Assalamu alaikum,";
  const invoiceLine = order.invoiceNumber
    ? `Invoice ${order.invoiceNumber}. `
    : "";
  // Escape the webhook-supplied name + invoice number for the HTML body (the
  // text variant is plain-text and safe as-is).
  const htmlGreeting = order.name
    ? `Assalamu alaikum ${escapeHtml(order.name)},`
    : "Assalamu alaikum,";
  const htmlInvoiceLine = order.invoiceNumber
    ? `Invoice ${escapeHtml(order.invoiceNumber)}. `
    : "";
  const subject = "Your Barakah purchase is confirmed";
  const text = `${greeting} thank you for supporting Barakah. ${invoiceLine}You paid ${amount} ${currency}. Your lifetime access is now active.`;
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
          <tr><td style="font-size:16px;line-height:1.5;">${htmlGreeting}</td></tr>
          <tr><td style="padding:16px 0;font-size:14px;line-height:1.6;color:#6b7280;">Thank you for supporting Barakah. ${htmlInvoiceLine}Your lifetime access is now active.</td></tr>
          <tr><td style="font-size:18px;font-weight:700;color:#29603E;">${amount} ${currency}</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  return { subject, html, text };
}

export function metadataAuthUserId(metadata: unknown): string | undefined {
  if (!(metadata && typeof metadata === "object")) {
    return;
  }
  const value = (metadata as Record<string, unknown>).authUserId;
  return typeof value === "string" && value.trim() ? value : undefined;
}

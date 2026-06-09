import { validateWebhook } from "@barakah/core/polar";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

import { createDatabase } from "@/db";
import { createRouter } from "@/lib/create-router";
import { enqueueEmail } from "@/lib/resend";
import { INTERNAL_SERVER_ERROR, OK } from "@/stoker/http-status-codes";

import {
  buildPurchaseEmail,
  metadataAuthUserId,
  recordPaidOrder,
} from "./polar.service";

// Plain POST (not OpenAPI): the raw request body must be read verbatim for HMAC
// signature verification, which an OpenAPI JSON parser would consume/transform.
export const polarWebhook = createRouter();

polarWebhook.post("/webhooks/polar", async (c) => {
  const body = await c.req.text();
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const secret = c.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return c.text("webhook not configured", INTERNAL_SERVER_ERROR);
  }

  const result = validateWebhook(
    body,
    headers,
    secret,
    validateEvent,
    WebhookVerificationError
  );
  if (!result.ok) {
    return c.text(result.message, result.status as 400 | 403);
  }

  const event = result.event;
  if (event.type !== "order.paid") {
    return c.text("ok", OK);
  }

  const order = event.data;
  const rawEmail = order.customer?.email;
  if (!rawEmail) {
    return c.text("ok", OK);
  }

  const email = rawEmail.toLowerCase().trim();
  const name = order.customer?.name ?? order.billingName ?? null;
  const db = createDatabase(c.env.DB);

  await recordPaidOrder(db, {
    authUserId: metadataAuthUserId(
      (order as unknown as { metadata?: unknown }).metadata
    ),
    polarOrderId: order.id,
    polarCustomerId: order.customer?.id,
    customerEmail: email,
    customerName: name ?? undefined,
    productId: order.product?.id,
    totalAmount: order.totalAmount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber ?? undefined,
    // Store the original JSON, not the SDK-parsed object (which turns date
    // strings into Date instances).
    raw: JSON.parse(body) as unknown,
  });

  // Durable enqueue (dedupeKey = order id) replaces the convex synchronous
  // send + confirm dance; the cron sweep delivers and retries. The dedupeKey
  // makes a webhook retry idempotent, so we always enqueue.
  const { subject, html, text } = buildPurchaseEmail({
    name,
    totalAmount: order.totalAmount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber ?? null,
  });
  await enqueueEmail(db, {
    to: email,
    subject,
    html,
    text,
    dedupeKey: `polar-order:${order.id}`,
  });

  return c.text("ok", OK);
});

import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import type { APIRoute } from "astro";
import { Resend } from "resend";
import { env } from "../../../env";
import { purchaseEmail } from "../../../lib/purchase-email";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let event;
  try {
    event = validateEvent(body, headers, env.POLAR_WEBHOOK_SECRET);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return new Response("invalid signature", { status: 403 });
    }
    return new Response("bad request", { status: 400 });
  }

  if (event.type !== "order.paid") {
    return new Response("ok", { status: 200 });
  }

  const order = event.data;
  const email = order.customer?.email;
  const name = order.customer?.name ?? order.billingName ?? null;
  if (!email) {
    return new Response("ok", { status: 200 });
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { subject, text, html } = purchaseEmail({
    name,
    totalAmount: order.totalAmount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber ?? null,
  });

  const send = await resend.emails.send({
    from: env.RESEND_FROM,
    to: email,
    subject,
    text,
    html,
    replyTo: env.RESEND_REPLY_TO,
  });

  if (send.error) {
    console.error("[polar webhook] email send failed", send.error);
    return new Response("email failed", { status: 502 });
  }

  return new Response("ok", { status: 200 });
};

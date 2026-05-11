import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { v } from "convex/values";
import { purchaseEmail } from "../../src/marketing/emails";
import {
  buildPolarOrderDoc,
  buildSubscriptionDoc,
  validateWebhook,
} from "../../src/polar";
import { internal } from "../_generated/api";
import { httpAction, internalMutation } from "../_generated/server";
import { sendEmail } from "./resend";

export const recordPaidOrder = internalMutation({
  args: {
    polarOrderId: v.string(),
    polarCustomerId: v.optional(v.string()),
    customerEmail: v.string(),
    customerName: v.optional(v.string()),
    productId: v.optional(v.string()),
    totalAmount: v.number(),
    currency: v.string(),
    invoiceNumber: v.optional(v.string()),
    raw: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const existingOrder = await ctx.db
      .query("polarOrders")
      .withIndex("by_polarOrderId", (q) =>
        q.eq("polarOrderId", args.polarOrderId)
      )
      .unique();

    if (existingOrder) {
      await ctx.db.patch(existingOrder._id, {
        polarCustomerId: args.polarCustomerId,
        customerEmail: args.customerEmail,
        customerName: args.customerName,
        productId: args.productId,
        totalAmount: args.totalAmount,
        currency: args.currency,
        invoiceNumber: args.invoiceNumber,
        receivedAt: now,
        raw: args.raw,
      });
    } else {
      await ctx.db.insert(
        "polarOrders",
        buildPolarOrderDoc(
          {
            polarOrderId: args.polarOrderId,
            polarCustomerId: args.polarCustomerId,
            customerEmail: args.customerEmail,
            customerName: args.customerName,
            productId: args.productId,
            totalAmount: args.totalAmount,
            currency: args.currency,
            invoiceNumber: args.invoiceNumber,
            raw: args.raw,
          },
          now
        )
      );
    }

    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_customerEmail", (q) =>
        q.eq("customerEmail", args.customerEmail)
      )
      .unique();

    if (existingSub) {
      await ctx.db.patch(existingSub._id, {
        status: "active",
        productId: "lifetime",
        source: "polar",
        polarCustomerId: args.polarCustomerId,
        polarProductId: args.productId,
        polarOrderId: args.polarOrderId,
        activatedAt: now,
        updatedAt: now,
      });
      return existingSub._id;
    }

    const subId = await ctx.db.insert(
      "subscriptions",
      buildSubscriptionDoc(
        {
          customerEmail: args.customerEmail,
          polarCustomerId: args.polarCustomerId,
          polarProductId: args.productId,
          polarOrderId: args.polarOrderId,
        },
        now
      )
    );

    return subId;
  },
});

export const webhook = httpAction(async (ctx, request) => {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const secret = process.env.POLAR_WEBHOOK_SECRET ?? "";
  const result = validateWebhook(
    body,
    headers,
    secret,
    validateEvent,
    WebhookVerificationError
  );

  if (!result.ok) {
    return new Response(result.message, { status: result.status });
  }

  const event = result.event;

  if (event.type !== "order.paid") {
    return new Response("ok", { status: 200 });
  }

  const order = event.data;
  const rawEmail = order.customer?.email;
  if (!rawEmail) {
    return new Response("ok", { status: 200 });
  }

  const email = rawEmail.toLowerCase().trim();
  const name = order.customer?.name ?? order.billingName ?? null;

  await ctx.runMutation(internal.lib.polar.recordPaidOrder, {
    polarOrderId: order.id,
    polarCustomerId: order.customer?.id,
    customerEmail: email,
    customerName: name ?? undefined,
    productId: order.product?.id,
    totalAmount: order.totalAmount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber ?? undefined,
    raw: order as unknown,
  });

  const { subject, text, html } = purchaseEmail({
    name,
    totalAmount: order.totalAmount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber ?? null,
  });

  try {
    await sendEmail(ctx, {
      to: email,
      subject,
      html,
      text,
    });
  } catch {
    return new Response("email failed", { status: 502 });
  }

  return new Response("ok", { status: 200 });
});

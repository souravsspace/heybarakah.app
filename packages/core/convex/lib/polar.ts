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
import type { Id } from "../_generated/dataModel";
import { httpAction, internalMutation } from "../_generated/server";
import { requireEnv } from "./env";
import { sendEmail } from "./resend";

// Convex's default runtime has no Node `Buffer`, but the Polar SDK's
// `validateEvent` base64-encodes the webhook secret via `Buffer.from(...)`.
// Without this, signature verification throws `ReferenceError: Buffer is not
// defined`, which surfaces to Polar as a 400. Provide a minimal base64/utf-8
// polyfill so verification runs in the default runtime.
const globalScope = globalThis as { Buffer?: unknown };
if (typeof globalScope.Buffer === "undefined") {
  globalScope.Buffer = {
    from(input: string) {
      const bytes = new TextEncoder().encode(input);
      return {
        toString(encoding?: string) {
          if (encoding !== "base64") {
            return input;
          }
          let binary = "";
          for (const byte of bytes) {
            binary += String.fromCharCode(byte);
          }
          return btoa(binary);
        },
      };
    },
  };
}

export const recordPaidOrder = internalMutation({
  args: {
    authUserId: v.optional(v.string()),
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

    let orderId: Id<"polarOrders">;
    let alreadyConfirmed: boolean;

    if (existingOrder) {
      alreadyConfirmed = Boolean(existingOrder.confirmedEmailAt);
      orderId = existingOrder._id;
      await ctx.db.patch(existingOrder._id, {
        ...(args.authUserId ? { authUserId: args.authUserId } : {}),
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
      alreadyConfirmed = false;
      orderId = await ctx.db.insert(
        "polarOrders",
        buildPolarOrderDoc(
          {
            authUserId: args.authUserId,
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

    const byAuthUserId = args.authUserId
      ? await ctx.db
          .query("subscriptions")
          .withIndex("by_authUserId", (q) =>
            q.eq("authUserId", args.authUserId)
          )
          .first()
      : null;
    const byPolarCustomerId =
      !byAuthUserId && args.polarCustomerId
        ? await ctx.db
            .query("subscriptions")
            .withIndex("by_polarCustomerId", (q) =>
              q.eq("polarCustomerId", args.polarCustomerId)
            )
            .first()
        : null;
    const existingSub =
      byAuthUserId ??
      byPolarCustomerId ??
      (await ctx.db
        .query("subscriptions")
        .withIndex("by_customerEmail", (q) =>
          q.eq("customerEmail", args.customerEmail)
        )
        .first());

    if (existingSub) {
      await ctx.db.patch(existingSub._id, {
        authUserId: args.authUserId ?? existingSub.authUserId,
        status: "active",
        productId: "lifetime",
        source: "polar",
        polarCustomerId: args.polarCustomerId,
        polarProductId: args.productId,
        polarOrderId: args.polarOrderId,
        activatedAt: now,
        updatedAt: now,
      });
      return { subId: existingSub._id, orderId, alreadyConfirmed };
    }

    const subId = await ctx.db.insert(
      "subscriptions",
      buildSubscriptionDoc(
        {
          authUserId: args.authUserId,
          customerEmail: args.customerEmail,
          polarCustomerId: args.polarCustomerId,
          polarProductId: args.productId,
          polarOrderId: args.polarOrderId,
        },
        now
      )
    );

    return { subId, orderId, alreadyConfirmed };
  },
});

export const queueOrderConfirmationEmail = internalMutation({
  args: { orderId: v.id("polarOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!(order?.confirmedEmailAt || order?.confirmationEmailQueuedAt)) {
      await ctx.db.patch(args.orderId, {
        confirmationEmailQueuedAt: new Date().toISOString(),
      });
      return true;
    }
    return false;
  },
});

export const markOrderEmailConfirmed = internalMutation({
  args: { orderId: v.id("polarOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      confirmedEmailAt: new Date().toISOString(),
    });
  },
});

export const clearOrderConfirmationEmailQueued = internalMutation({
  args: { orderId: v.id("polarOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      confirmationEmailQueuedAt: undefined,
    });
  },
});

function metadataAuthUserId(metadata: unknown): string | undefined {
  if (!(metadata && typeof metadata === "object")) {
    return;
  }
  const value = (metadata as Record<string, unknown>).authUserId;
  return typeof value === "string" && value.trim() ? value : undefined;
}

export const webhook = httpAction(async (ctx, request) => {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const secret = requireEnv("POLAR_WEBHOOK_SECRET");
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
  const authUserId = metadataAuthUserId(
    (order as unknown as { metadata?: unknown }).metadata
  );

  const recorded = await ctx.runMutation(internal.lib.polar.recordPaidOrder, {
    authUserId,
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

  if (recorded.alreadyConfirmed) {
    return new Response("ok", { status: 200 });
  }
  const queued = await ctx.runMutation(
    internal.lib.polar.queueOrderConfirmationEmail,
    {
      orderId: recorded.orderId,
    }
  );
  if (!queued) {
    return new Response("ok", { status: 200 });
  }

  const { subject, text, html } = await purchaseEmail({
    name,
    totalAmount: order.totalAmount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber ?? null,
  });

  // Only a genuine send failure clears the queue marker and asks Polar to retry.
  // If the send succeeded but marking it confirmed throws, do NOT clear/retry —
  // that would re-send a receipt that already went out. Confirmation is reconciled
  // on the next webhook via recordPaidOrder's alreadyConfirmed/queued guard.
  try {
    await sendEmail(ctx, {
      to: email,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("[polar webhook] purchase email send failed", email, err);
    await ctx.runMutation(
      internal.lib.polar.clearOrderConfirmationEmailQueued,
      {
        orderId: recorded.orderId,
      }
    );
    return new Response("purchase email failed", { status: 502 });
  }

  try {
    await ctx.runMutation(internal.lib.polar.markOrderEmailConfirmed, {
      orderId: recorded.orderId,
    });
  } catch (err) {
    console.error(
      "[polar webhook] mark email confirmed failed (email already sent)",
      email,
      err
    );
  }

  return new Response("ok", { status: 200 });
});

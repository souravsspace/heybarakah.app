import type {
  validateEvent as validateEventFn,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

export function validateWebhook(
  body: string,
  headers: Record<string, string>,
  secret: string,
  validateFn: typeof validateEventFn,
  VerificationError: typeof WebhookVerificationError
):
  | { ok: true; event: ReturnType<typeof validateEventFn> }
  | { ok: false; status: number; message: string } {
  try {
    const event = validateFn(body, headers, secret);
    return { ok: true, event };
  } catch (err) {
    if (err instanceof VerificationError) {
      return { ok: false, status: 403, message: "invalid signature" };
    }
    return { ok: false, status: 400, message: "bad request" };
  }
}

export function buildPolarOrderDoc(
  args: {
    authUserId?: string;
    polarOrderId: string;
    polarCustomerId?: string;
    customerEmail: string;
    customerName?: string;
    productId?: string;
    totalAmount: number;
    currency: string;
    invoiceNumber?: string;
    raw?: unknown;
  },
  now: string
) {
  return {
    authUserId: args.authUserId,
    polarOrderId: args.polarOrderId,
    polarCustomerId: args.polarCustomerId,
    customerEmail: args.customerEmail,
    customerName: args.customerName,
    productId: args.productId,
    totalAmount: args.totalAmount,
    currency: args.currency,
    invoiceNumber: args.invoiceNumber,
    eventType: "order.paid" as const,
    receivedAt: now,
    raw: args.raw,
  };
}

export function buildSubscriptionDoc(
  args: {
    authUserId?: string;
    customerEmail: string;
    polarCustomerId?: string;
    polarProductId?: string;
    polarOrderId?: string;
  },
  now: string
) {
  return {
    authUserId: args.authUserId,
    customerEmail: args.customerEmail,
    productId: "lifetime" as const,
    status: "active" as const,
    source: "polar" as const,
    polarCustomerId: args.polarCustomerId,
    polarProductId: args.polarProductId,
    polarOrderId: args.polarOrderId,
    activatedAt: now,
    updatedAt: now,
  };
}

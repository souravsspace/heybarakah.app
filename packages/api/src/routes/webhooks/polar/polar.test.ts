import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { validateEventMock, VerificationError } = vi.hoisted(() => ({
  validateEventMock: vi.fn(),
  VerificationError: class WebhookVerificationError extends Error {},
}));

vi.mock("@polar-sh/sdk/webhooks", () => ({
  validateEvent: validateEventMock,
  WebhookVerificationError: VerificationError,
}));

import { validateWebhook } from "@barakah/core/polar";
import { createDatabase } from "@/db";
import { emailQueue, polarOrders, subscriptions } from "@/db/schema";
import { createApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { polarWebhook } from "./polar.index";
import { recordPaidOrder } from "./polar.service";

applyMigrations();

function paidEvent(orderId: string, email = "buyer@example.com") {
  return {
    type: "order.paid",
    data: {
      id: orderId,
      customer: { id: "cus_1", email, name: "Buyer" },
      product: { id: "prod_1" },
      totalAmount: 4900,
      currency: "usd",
      invoiceNumber: "INV-1",
      metadata: { authUserId: "user-1" },
    },
  };
}

function post(body: unknown) {
  return new Request("http://localhost/webhooks/polar", {
    method: "POST",
    headers: { "Content-Type": "application/json", "webhook-id": "wh_1" },
    body: JSON.stringify(body),
  });
}

function appWith() {
  const app = createApp();
  app.route("/", polarWebhook);
  return app;
}

beforeEach(() => validateEventMock.mockReset());

describe("polar webhook", () => {
  it("maps a signature-verification failure to a 403 result", () => {
    // Asserted on validateWebhook's result (which the route returns verbatim via
    // `if (!result.ok) return result.status`). A plain throwing fn is used — not
    // the vi.fn spy — because the workers pool flags a spy's thrown error as
    // unhandled even when app code catches it.
    const throwingValidate = (() => {
      throw new VerificationError("bad");
    }) as unknown as typeof validateEventMock;
    const result = validateWebhook(
      "{}",
      {},
      "secret",
      throwingValidate,
      VerificationError
    );
    expect(result).toEqual({
      ok: false,
      status: 403,
      message: "invalid signature",
    });
  });

  it("records a paid order, activates a subscription, and enqueues a receipt", async () => {
    const event = paidEvent("order-1");
    validateEventMock.mockReturnValue(event);

    const res = await appWith().request(post(event), undefined, env);
    expect(res.status).toBe(200);

    const db = createDatabase(env.DB);
    const orders = await db
      .select()
      .from(polarOrders)
      .where(eq(polarOrders.polarOrderId, "order-1"));
    expect(orders).toHaveLength(1);

    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.polarOrderId, "order-1"));
    expect(subs).toHaveLength(1);
    expect(subs[0].status).toBe("active");
    expect(subs[0].source).toBe("polar");

    const queued = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.dedupeKey, "polar-order:order-1"));
    expect(queued).toHaveLength(1);
  });

  it("recordPaidOrder normalizes the customer email to lowercase at write", async () => {
    const db = createDatabase(env.DB);
    await recordPaidOrder(db, {
      polarOrderId: "order-case",
      customerEmail: " Buyer.CASE@Example.COM ",
      currency: "usd",
      totalAmount: 4900,
    });

    const [order] = await db
      .select()
      .from(polarOrders)
      .where(eq(polarOrders.polarOrderId, "order-case"));
    expect(order.customerEmail).toBe("buyer.case@example.com");

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.polarOrderId, "order-case"));
    expect(sub.customerEmail).toBe("buyer.case@example.com");
  });

  it("is idempotent — a redelivered order does not double-insert", async () => {
    const event = paidEvent("order-2");
    validateEventMock.mockReturnValue(event);
    const app = appWith();

    await app.request(post(event), undefined, env);
    await app.request(post(event), undefined, env);

    const db = createDatabase(env.DB);
    expect(
      await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.polarOrderId, "order-2"))
    ).toHaveLength(1);
    expect(
      await db
        .select()
        .from(emailQueue)
        .where(eq(emailQueue.dedupeKey, "polar-order:order-2"))
    ).toHaveLength(1);
  });

  it("activation upsert yields exactly one active subscription row when the same order is processed twice", async () => {
    // No authUserId in metadata, so resolveExistingPolarSub can only match on
    // polarOrderId — exercising the onConflictDoUpdate path that closes the
    // concurrent-redelivery window (UNIQUE(polarOrderId)).
    const event = {
      type: "order.paid",
      data: {
        id: "order-3",
        customer: { id: "cus_3", email: "buyer3@example.com", name: "Buyer 3" },
        product: { id: "prod_1" },
        totalAmount: 4900,
        currency: "usd",
        invoiceNumber: "INV-3",
      },
    };
    validateEventMock.mockReturnValue(event);
    const app = appWith();

    await app.request(post(event), undefined, env);
    await app.request(post(event), undefined, env);

    const db = createDatabase(env.DB);
    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.polarOrderId, "order-3"));
    expect(subs).toHaveLength(1);
    expect(subs[0].status).toBe("active");
    expect(subs[0].source).toBe("polar");
  });

  it("ignores non-order.paid events", async () => {
    validateEventMock.mockReturnValue({ type: "order.refunded", data: {} });
    const res = await appWith().request(post({}), undefined, env);
    expect(res.status).toBe(200);
  });
});

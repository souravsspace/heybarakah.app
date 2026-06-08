import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import migration0001 from "@/db/migrations/0001_legal_solo.sql?raw";
import migration0002 from "@/db/migrations/0002_smiling_johnny_blaze.sql?raw";
import { emailQueue, polarOrders, subscriptions } from "@/db/schema";
import { createApp } from "@/lib/create-app";

import { polarWebhook } from "./polar.index";

async function applyMigrations() {
  for (const sql of [migration0000, migration0001, migration0002]) {
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await env.DB.prepare(statement).run();
    }
  }
}

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

beforeAll(applyMigrations);
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

  it("ignores non-order.paid events", async () => {
    validateEventMock.mockReturnValue({ type: "order.refunded", data: {} });
    const res = await appWith().request(post({}), undefined, env);
    expect(res.status).toBe(200);
  });
});

import { describe, expect, test } from "bun:test";
import {
  buildPolarOrderDoc,
  buildSubscriptionDoc,
  validateWebhook,
} from "./webhook";

class MockWebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

describe("validateWebhook", () => {
  test("returns event on successful validation", () => {
    const mockEvent = {
      type: "order.paid" as const,
      timestamp: new Date(),
      data: { id: "order_123" },
    };
    const mockValidate = () =>
      mockEvent as unknown as ReturnType<Parameters<typeof validateWebhook>[3]>;

    const result = validateWebhook(
      "body",
      { "x-polar-signature": "sig" },
      "secret",
      mockValidate as unknown as Parameters<typeof validateWebhook>[3],
      MockWebhookVerificationError as unknown as Parameters<
        typeof validateWebhook
      >[4]
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.event as unknown as typeof mockEvent).type).toBe(
        "order.paid"
      );
    }
  });

  test("returns 403 on webhook verification error", () => {
    const mockValidate = () => {
      throw new MockWebhookVerificationError("bad signature");
    };

    const result = validateWebhook(
      "body",
      { "x-polar-signature": "sig" },
      "secret",
      mockValidate as unknown as Parameters<typeof validateWebhook>[3],
      MockWebhookVerificationError as unknown as Parameters<
        typeof validateWebhook
      >[4]
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.message).toBe("invalid signature");
    }
  });

  test("returns 400 on generic validation error", () => {
    const mockValidate = () => {
      throw new Error("something else");
    };

    const result = validateWebhook(
      "body",
      { "x-polar-signature": "sig" },
      "secret",
      mockValidate as unknown as Parameters<typeof validateWebhook>[3],
      MockWebhookVerificationError as unknown as Parameters<
        typeof validateWebhook
      >[4]
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.message).toBe("bad request");
    }
  });
});

describe("buildPolarOrderDoc", () => {
  test("builds order document with all fields", () => {
    const doc = buildPolarOrderDoc(
      {
        authUserId: "auth_user_123",
        polarOrderId: "order_123",
        polarCustomerId: "cust_456",
        customerEmail: "test@example.com",
        customerName: "Test User",
        productId: "prod_789",
        totalAmount: 4900,
        currency: "usd",
        invoiceNumber: "INV-001",
        raw: { id: "order_123" },
      },
      "2024-01-01T00:00:00.000Z"
    );

    expect(doc).toEqual({
      authUserId: "auth_user_123",
      polarOrderId: "order_123",
      polarCustomerId: "cust_456",
      customerEmail: "test@example.com",
      customerName: "Test User",
      productId: "prod_789",
      totalAmount: 4900,
      currency: "usd",
      invoiceNumber: "INV-001",
      eventType: "order.paid",
      receivedAt: "2024-01-01T00:00:00.000Z",
      raw: { id: "order_123" },
    });
  });

  test("builds order document with minimal fields", () => {
    const doc = buildPolarOrderDoc(
      {
        polarOrderId: "order_123",
        customerEmail: "test@example.com",
        totalAmount: 4900,
        currency: "usd",
      },
      "2024-01-01T00:00:00.000Z"
    );

    expect(doc.polarOrderId).toBe("order_123");
    expect(doc.polarCustomerId).toBeUndefined();
    expect(doc.eventType).toBe("order.paid");
  });
});

describe("buildSubscriptionDoc", () => {
  test("builds subscription document with lifetime product", () => {
    const doc = buildSubscriptionDoc(
      {
        customerEmail: "test@example.com",
        authUserId: "auth_user_123",
        polarCustomerId: "cust_456",
        polarProductId: "prod_789",
        polarOrderId: "order_123",
      },
      "2024-01-01T00:00:00.000Z"
    );

    expect(doc).toEqual({
      authUserId: "auth_user_123",
      customerEmail: "test@example.com",
      productId: "lifetime",
      status: "active",
      source: "polar",
      polarCustomerId: "cust_456",
      polarProductId: "prod_789",
      polarOrderId: "order_123",
      activatedAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
  });

  test("builds subscription document with minimal fields", () => {
    const doc = buildSubscriptionDoc(
      {
        customerEmail: "test@example.com",
      },
      "2024-01-01T00:00:00.000Z"
    );

    expect(doc.productId).toBe("lifetime");
    expect(doc.status).toBe("active");
    expect(doc.source).toBe("polar");
    expect(doc.polarCustomerId).toBeUndefined();
  });
});

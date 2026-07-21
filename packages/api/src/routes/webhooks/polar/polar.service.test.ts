import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { polarOrders, subscriptions } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";

import {
  buildPurchaseEmail,
  metadataAuthUserId,
  type PaidOrderInput,
  recordPaidOrder,
} from "./polar.service";

applyMigrations();

describe("buildPurchaseEmail", () => {
  it("formats the amount as currency with two decimals and upper-case code", () => {
    const email = buildPurchaseEmail({
      name: "Aisha",
      totalAmount: 4900,
      currency: "usd",
      invoiceNumber: "INV-1",
    });
    expect(email.subject).toBe("Your Barakah purchase is confirmed");
    expect(email.text).toContain("49.00 USD");
    expect(email.html).toContain("49.00 USD");
  });

  it("greets by name when present, generically when null", () => {
    expect(
      buildPurchaseEmail({
        name: "Aisha",
        totalAmount: 100,
        currency: "usd",
        invoiceNumber: null,
      }).text
    ).toContain("Assalamu alaikum Aisha,");
    expect(
      buildPurchaseEmail({
        name: null,
        totalAmount: 100,
        currency: "usd",
        invoiceNumber: null,
      }).text
    ).toContain("Assalamu alaikum,");
  });

  it("includes the invoice line only when an invoice number is given", () => {
    expect(
      buildPurchaseEmail({
        name: null,
        totalAmount: 100,
        currency: "usd",
        invoiceNumber: "INV-9",
      }).text
    ).toContain("Invoice INV-9.");
    expect(
      buildPurchaseEmail({
        name: null,
        totalAmount: 100,
        currency: "usd",
        invoiceNumber: null,
      }).text
    ).not.toContain("Invoice");
  });

  it("HTML-escapes the name and invoice but leaves the text variant raw", () => {
    const email = buildPurchaseEmail({
      name: "<b>x</b>",
      totalAmount: 100,
      currency: "usd",
      invoiceNumber: "<i>7</i>",
    });
    expect(email.html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(email.html).not.toContain("<b>x</b>");
    expect(email.text).toContain("<b>x</b>");
  });
});

describe("metadataAuthUserId", () => {
  it("returns a non-empty string authUserId", () => {
    expect(metadataAuthUserId({ authUserId: "user-1" })).toBe("user-1");
  });

  it("returns undefined for blank, non-string, or absent values", () => {
    expect(metadataAuthUserId({ authUserId: "   " })).toBeUndefined();
    expect(metadataAuthUserId({ authUserId: 123 })).toBeUndefined();
    expect(metadataAuthUserId({})).toBeUndefined();
  });

  it("returns undefined for non-object metadata", () => {
    expect(metadataAuthUserId(null)).toBeUndefined();
    expect(metadataAuthUserId("user-1")).toBeUndefined();
    expect(metadataAuthUserId(undefined)).toBeUndefined();
  });
});

describe("recordPaidOrder", () => {
  function input(over: Partial<PaidOrderInput> = {}): PaidOrderInput {
    return {
      polarOrderId: `ord_${crypto.randomUUID()}`,
      customerEmail: "Buyer@Example.com",
      customerName: "Buyer",
      totalAmount: 4900,
      currency: "usd",
      ...over,
    };
  }

  it("records the order and activates a lifetime polar subscription", async () => {
    const db = createDatabase(env.DB);
    const args = input({ authUserId: "user-rp-1" });
    await recordPaidOrder(db, args);

    const orders = await db
      .select()
      .from(polarOrders)
      .where(eq(polarOrders.polarOrderId, args.polarOrderId));
    expect(orders).toHaveLength(1);
    // Email is normalized to lower-case at write time.
    expect(orders[0].customerEmail).toBe("buyer@example.com");

    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.authUserId, "user-rp-1"));
    expect(subs).toHaveLength(1);
    expect(subs[0].status).toBe("active");
    expect(subs[0].productId).toBe("lifetime");
    expect(subs[0].source).toBe("polar");
  });

  it("is idempotent on redelivery of the same order id", async () => {
    const db = createDatabase(env.DB);
    const args = input({ authUserId: "user-rp-2" });
    await recordPaidOrder(db, args);
    await recordPaidOrder(db, args);

    const orders = await db
      .select()
      .from(polarOrders)
      .where(eq(polarOrders.polarOrderId, args.polarOrderId));
    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.authUserId, "user-rp-2"));
    expect(orders).toHaveLength(1);
    expect(subs).toHaveLength(1);
  });
});

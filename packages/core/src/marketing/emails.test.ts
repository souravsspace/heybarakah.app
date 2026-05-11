import { describe, expect, test } from "bun:test";
import { purchaseEmail, welcomeEmail } from "./emails";

describe("welcomeEmail", () => {
  test("returns correct subject", () => {
    const { subject } = welcomeEmail();
    expect(subject).toBe("You're on the Barakah waitlist");
  });

  test("contains expected text content", () => {
    const { text } = welcomeEmail();
    expect(text).toContain("Bismillah ir-Rahman ir-Raheem.");
    expect(text).toContain("You're on the list.");
    expect(text).toContain("Barakah is a calm companion for salah.");
    expect(text).toContain("Wa salaam,");
    expect(text).toContain("heybarakah.app");
  });

  test("contains expected html content", () => {
    const { html } = welcomeEmail();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Barakah");
    expect(html).toContain("You're on the list.");
    expect(html).toContain("heybarakah.app");
  });
});

describe("purchaseEmail", () => {
  test("formats amount correctly in USD", () => {
    const { text, html } = purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("$29.00");
    expect(html).toContain("$29.00");
  });

  test("formats amount correctly in EUR", () => {
    const { text } = purchaseEmail({ totalAmount: 5000, currency: "eur" });
    expect(text).toContain("€50.00");
  });

  test("includes name when provided", () => {
    const { text, html } = purchaseEmail({
      name: "Ahmad",
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("As-salaamu alaykum, Ahmad.");
    expect(html).toContain("As-salaamu alaykum, Ahmad.");
  });

  test("uses default greeting when name is not provided", () => {
    const { text } = purchaseEmail({ totalAmount: 2900, currency: "usd" });
    expect(text).toContain("As-salaamu alaykum.");
    expect(text).not.toContain("As-salaamu alaykum, undefined");
  });

  test("uses default greeting when name is null", () => {
    const { text } = purchaseEmail({
      name: null,
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("As-salaamu alaykum.");
  });

  test("includes invoice number when provided", () => {
    const { text, html } = purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
      invoiceNumber: "INV-001",
    });
    expect(text).toContain("Invoice: INV-001");
    expect(html).toContain("INV-001");
  });

  test("does not include invoice line when invoiceNumber is not provided", () => {
    const { text, html } = purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).not.toContain("Invoice:");
    expect(html).not.toContain("Invoice</td>");
  });

  test("does not include invoice line when invoiceNumber is null", () => {
    const { text } = purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
      invoiceNumber: null,
    });
    expect(text).not.toContain("Invoice:");
  });

  test("returns correct subject", () => {
    const { subject } = purchaseEmail({ totalAmount: 2900, currency: "usd" });
    expect(subject).toBe("Your Barakah lifetime is confirmed");
  });

  test("contains expected text content", () => {
    const { text } = purchaseEmail({ totalAmount: 2900, currency: "usd" });
    expect(text).toContain("Bismillah ir-Rahman ir-Raheem.");
    expect(text).toContain("Your lifetime access to Barakah is confirmed.");
    expect(text).toContain("Jazak Allahu khayran");
    expect(text).toContain("Wa salaam,");
  });

  test("contains expected html content", () => {
    const { html } = purchaseEmail({ totalAmount: 2900, currency: "usd" });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Barakah — Lifetime");
    expect(html).toContain("Your lifetime is confirmed.");
  });

  test("falls back to plain format for invalid currency", () => {
    const { text } = purchaseEmail({
      totalAmount: 2900,
      currency: "INVALID",
    });
    expect(text).toContain("29.00 INVALID");
  });
});

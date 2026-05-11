import { describe, expect, test } from "bun:test";
import { purchaseEmail, welcomeEmail } from "./emails";

describe("welcomeEmail", () => {
  test("returns correct subject", async () => {
    const { subject } = await welcomeEmail();
    expect(subject).toBe("You're on the Barakah waitlist");
  });

  test("contains expected text content", async () => {
    const { text } = await welcomeEmail();
    expect(text).toContain("Bismillah ir-Rahman ir-Raheem.");
    expect(text.toLowerCase()).toContain("you're on the list.");
    expect(text).toContain("Barakah is a calm companion for salah.");
    expect(text).toContain("Wa salaam,");
    expect(text).toContain("heybarakah.app");
  });

  test("contains expected html content", async () => {
    const { html } = await welcomeEmail();
    expect(html).toContain("<!DOCTYPE");
    expect(html).toContain("Barakah");
    expect(html).toContain("You&#x27;re on the list.");
    expect(html).toContain("heybarakah.app");
  });
});

describe("purchaseEmail", () => {
  test("formats amount correctly in USD", async () => {
    const { text, html } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("$29.00");
    expect(html).toContain("$29.00");
  });

  test("formats amount correctly in EUR", async () => {
    const { text } = await purchaseEmail({
      totalAmount: 5000,
      currency: "eur",
    });
    expect(text).toContain("€50.00");
  });

  test("includes name when provided", async () => {
    const { text, html } = await purchaseEmail({
      name: "Ahmad",
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("As-salaamu alaykum, Ahmad.");
    expect(html).toContain("Ahmad");
  });

  test("uses default greeting when name is not provided", async () => {
    const { text } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("As-salaamu alaykum.");
    expect(text).not.toContain("As-salaamu alaykum, undefined");
  });

  test("uses default greeting when name is null", async () => {
    const { text } = await purchaseEmail({
      name: null,
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("As-salaamu alaykum.");
  });

  test("includes invoice number when provided", async () => {
    const { text, html } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
      invoiceNumber: "INV-001",
    });
    expect(text).toContain("INV-001");
    expect(html).toContain("INV-001");
  });

  test("does not include invoice line when invoiceNumber is not provided", async () => {
    const { text } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).not.toContain("INVOICE");
  });

  test("does not include invoice line when invoiceNumber is null", async () => {
    const { text } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
      invoiceNumber: null,
    });
    expect(text).not.toContain("INVOICE");
  });

  test("returns correct subject", async () => {
    const { subject } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(subject).toBe("Your Barakah lifetime is confirmed");
  });

  test("contains expected text content", async () => {
    const { text } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(text).toContain("Bismillah ir-Rahman ir-Raheem.");
    expect(text).toContain("Your lifetime access to Barakah is confirmed.");
    expect(text).toContain("Jazak Allahu khayran");
    expect(text).toContain("Wa salaam,");
  });

  test("contains expected html content", async () => {
    const { html } = await purchaseEmail({
      totalAmount: 2900,
      currency: "usd",
    });
    expect(html).toContain("<!DOCTYPE");
    expect(html).toContain("Barakah");
    expect(html).toContain("Your lifetime is confirmed.");
  });

  test("falls back to plain format for invalid currency", async () => {
    const { text } = await purchaseEmail({
      totalAmount: 2900,
      currency: "INVALID",
    });
    expect(text).toContain("29.00 INVALID");
  });
});

import { describe, expect, test } from "bun:test";
import {
  buildRevenueCatSubscriptionDoc,
  resolveProductId,
  shouldSkipRcSync,
} from "./index";

const NOW = "2026-05-21T12:00:00.000Z";
const USER = "user_1";

describe("resolveProductId", () => {
  test("maps known identifiers", () => {
    expect(resolveProductId("barakah_yearly", "monthly")).toBe("yearly");
    expect(resolveProductId("barakah_monthly", "yearly")).toBe("monthly");
    expect(resolveProductId("barakah_family", "monthly")).toBe("family");
  });

  test("falls back when unknown or missing", () => {
    expect(resolveProductId(undefined, "monthly")).toBe("monthly");
    expect(resolveProductId("unknown_sku", "yearly")).toBe("yearly");
  });
});

describe("shouldSkipRcSync", () => {
  test("skips polar rows", () => {
    expect(shouldSkipRcSync("polar")).toBe(true);
  });
  test("does not skip mock or revenuecat", () => {
    expect(shouldSkipRcSync("mock")).toBe(false);
    expect(shouldSkipRcSync("revenuecat")).toBe(false);
    expect(shouldSkipRcSync(undefined)).toBe(false);
  });
});

describe("buildRevenueCatSubscriptionDoc", () => {
  test("active entitlement maps to active doc with product id resolved", () => {
    const doc = buildRevenueCatSubscriptionDoc(
      {
        authUserId: USER,
        entitlementActive: true,
        productIdentifier: "barakah_yearly",
        entitlementId: "premium",
        store: "app_store",
        periodType: "trial",
        willRenew: true,
        rcAppUserId: "rc_user_1",
        originalAppUserId: "rc_user_1",
        latestPurchaseAt: NOW,
        expiresAt: "2027-05-21T12:00:00.000Z",
      },
      NOW
    );

    expect(doc.status).toBe("active");
    expect(doc.productId).toBe("yearly");
    expect(doc.source).toBe("revenuecat");
    expect(doc.activatedAt).toBe(NOW);
    expect(doc.updatedAt).toBe(NOW);
    expect(doc.expiresAt).toBe("2027-05-21T12:00:00.000Z");
    expect(doc.rcEntitlementId).toBe("premium");
    expect(doc.rcStore).toBe("app_store");
    expect(doc.rcWillRenew).toBe(true);
  });

  test("inactive entitlement maps to canceled with no activatedAt", () => {
    const doc = buildRevenueCatSubscriptionDoc(
      {
        authUserId: USER,
        entitlementActive: false,
        productIdentifier: "barakah_monthly",
      },
      NOW
    );

    expect(doc.status).toBe("canceled");
    expect(doc.activatedAt).toBeUndefined();
    expect(doc.productId).toBe("monthly");
  });

  test("falls back to existing product id when identifier missing", () => {
    const doc = buildRevenueCatSubscriptionDoc(
      { authUserId: USER, entitlementActive: true },
      NOW,
      "family"
    );

    expect(doc.productId).toBe("family");
  });
});

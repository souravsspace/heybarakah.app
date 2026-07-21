import { describe, expect, test } from "bun:test";

import {
  buildRevenueCatSubscriptionDoc,
  type RevenueCatSyncInput,
  resolveProductId,
  shouldSkipRcSync,
} from "./index";

const NOW = "2026-03-01T00:00:00.000Z";

function baseInput(
  over: Partial<RevenueCatSyncInput> = {}
): RevenueCatSyncInput {
  return {
    authUserId: "user_1",
    entitlementActive: true,
    ...over,
  };
}

describe("resolveProductId", () => {
  test("maps known store identifiers", () => {
    expect(resolveProductId("barakah_yearly", "monthly")).toBe("yearly");
    expect(resolveProductId("barakah_monthly", "yearly")).toBe("monthly");
    expect(resolveProductId("barakah_family", "monthly")).toBe("family");
  });

  test("returns fallback for unknown identifier", () => {
    expect(resolveProductId("something_else", "lifetime")).toBe("lifetime");
  });

  test("returns fallback when identifier is undefined", () => {
    expect(resolveProductId(undefined, "monthly")).toBe("monthly");
  });
});

describe("buildRevenueCatSubscriptionDoc", () => {
  test("active entitlement yields active status and source revenuecat", () => {
    const doc = buildRevenueCatSubscriptionDoc(baseInput(), NOW);
    expect(doc.status).toBe("active");
    expect(doc.source).toBe("revenuecat");
    expect(doc.updatedAt).toBe(NOW);
  });

  test("inactive entitlement is canceled with no activatedAt", () => {
    const doc = buildRevenueCatSubscriptionDoc(
      baseInput({ entitlementActive: false }),
      NOW
    );
    expect(doc.status).toBe("canceled");
    expect(doc.activatedAt).toBeUndefined();
  });

  test("stamps activatedAt = now when activating a row with none", () => {
    const doc = buildRevenueCatSubscriptionDoc(baseInput(), NOW);
    expect(doc.activatedAt).toBe(NOW);
  });

  test("preserves the original activatedAt across re-syncs", () => {
    const earlier = "2025-01-01T00:00:00.000Z";
    const doc = buildRevenueCatSubscriptionDoc(
      baseInput(),
      NOW,
      "yearly",
      earlier
    );
    expect(doc.activatedAt).toBe(earlier);
  });

  test("resolves product from identifier over the existing fallback", () => {
    const doc = buildRevenueCatSubscriptionDoc(
      baseInput({ productIdentifier: "barakah_family" }),
      NOW,
      "monthly"
    );
    expect(doc.productId).toBe("family");
  });

  test("defaults product to monthly when nothing resolvable", () => {
    const doc = buildRevenueCatSubscriptionDoc(baseInput(), NOW);
    expect(doc.productId).toBe("monthly");
  });

  test("passes through RevenueCat metadata", () => {
    const doc = buildRevenueCatSubscriptionDoc(
      baseInput({
        rcAppUserId: "rc_1",
        originalAppUserId: "orig_1",
        store: "app_store",
        periodType: "trial",
        willRenew: true,
        expiresAt: "2027-01-01T00:00:00.000Z",
        latestPurchaseAt: "2026-02-01T00:00:00.000Z",
        entitlementId: "Barakah Premium",
      }),
      NOW
    );
    expect(doc.rcAppUserId).toBe("rc_1");
    expect(doc.rcOriginalAppUserId).toBe("orig_1");
    expect(doc.rcStore).toBe("app_store");
    expect(doc.rcPeriodType).toBe("trial");
    expect(doc.rcWillRenew).toBe(true);
    expect(doc.rcEntitlementId).toBe("Barakah Premium");
  });
});

describe("shouldSkipRcSync", () => {
  test("skips when existing source is polar", () => {
    expect(shouldSkipRcSync("polar")).toBe(true);
  });

  test("does not skip for revenuecat or undefined", () => {
    expect(shouldSkipRcSync("revenuecat")).toBe(false);
    expect(shouldSkipRcSync(undefined)).toBe(false);
  });
});

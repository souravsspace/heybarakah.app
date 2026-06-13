import type {
  ProductId,
  RevenueCatPeriodType,
  RevenueCatStore,
} from "./validators";

export * from "./validators";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "canceled"
  | "past_due";

export interface RevenueCatSyncInput {
  authUserId: string;
  entitlementActive: boolean;
  entitlementId?: string;
  expiresAt?: string;
  latestPurchaseAt?: string;
  originalAppUserId?: string;
  periodType?: RevenueCatPeriodType;
  productIdentifier?: string;
  rcAppUserId?: string;
  store?: RevenueCatStore;
  willRenew?: boolean;
}

export interface RevenueCatSubscriptionDoc {
  activatedAt?: string;
  authUserId: string;
  expiresAt?: string;
  productId: ProductId;
  rcAppUserId?: string;
  rcEntitlementId?: string;
  rcLatestPurchaseAt?: string;
  rcOriginalAppUserId?: string;
  rcPeriodType?: RevenueCatPeriodType;
  rcProductIdentifier?: string;
  rcStore?: RevenueCatStore;
  rcWillRenew?: boolean;
  source: "revenuecat";
  status: SubscriptionStatus;
  updatedAt: string;
}

const PRODUCT_ID_MAP: Record<string, ProductId> = {
  barakah_yearly: "yearly",
  barakah_monthly: "monthly",
  barakah_family: "family",
};

export function resolveProductId(
  productIdentifier: string | undefined,
  fallback: ProductId
): ProductId {
  if (!productIdentifier) {
    return fallback;
  }
  return PRODUCT_ID_MAP[productIdentifier] ?? fallback;
}

export function buildRevenueCatSubscriptionDoc(
  input: RevenueCatSyncInput,
  now: string,
  existingProductId?: ProductId,
  existingActivatedAt?: string
): RevenueCatSubscriptionDoc {
  const product = resolveProductId(
    input.productIdentifier,
    existingProductId ?? "monthly"
  );
  const status: SubscriptionStatus = input.entitlementActive
    ? "active"
    : "canceled";

  return {
    authUserId: input.authUserId,
    productId: product,
    status,
    source: "revenuecat",
    // Preserve the original activation timestamp across re-syncs; only stamp a
    // fresh one when activating a row that had none.
    activatedAt: input.entitlementActive
      ? (existingActivatedAt ?? now)
      : undefined,
    updatedAt: now,
    expiresAt: input.expiresAt,
    rcAppUserId: input.rcAppUserId,
    rcOriginalAppUserId: input.originalAppUserId,
    rcProductIdentifier: input.productIdentifier,
    rcEntitlementId: input.entitlementId,
    rcStore: input.store,
    rcPeriodType: input.periodType,
    rcWillRenew: input.willRenew,
    rcLatestPurchaseAt: input.latestPurchaseAt,
  };
}

export function shouldSkipRcSync(existingSource: string | undefined): boolean {
  return existingSource === "polar";
}

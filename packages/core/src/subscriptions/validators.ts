export const PRODUCT_IDS = ["yearly", "monthly", "family", "lifetime"] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export const REVENUE_CAT_STORES = [
  "app_store",
  "play_store",
  "stripe",
  "promotional",
  "mac_app_store",
  "amazon",
] as const;

export type RevenueCatStore = (typeof REVENUE_CAT_STORES)[number];

export const REVENUE_CAT_PERIOD_TYPES = ["normal", "trial", "intro"] as const;

export type RevenueCatPeriodType = (typeof REVENUE_CAT_PERIOD_TYPES)[number];

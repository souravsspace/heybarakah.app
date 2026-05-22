import { env } from "@barakah/env/app";
import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";

export const ENTITLEMENT_ID = "premium";

export const RC_PRODUCT_IDENTIFIERS = {
  yearly: "barakah_yearly",
  monthly: "barakah_monthly",
  family: "barakah_family",
} as const;

export type RcPlanId = keyof typeof RC_PRODUCT_IDENTIFIERS;

let configuredFor: string | null = null;

function getApiKey(): string | null {
  if (Platform.OS === "ios") {
    return env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? null;
  }
  if (Platform.OS === "android") {
    return env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? null;
  }
  return null;
}

export function isRevenueCatSupported(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}

export async function configureRevenueCat(authUserId: string): Promise<void> {
  if (!isRevenueCatSupported()) {
    return;
  }
  if (configuredFor === authUserId) {
    return;
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return;
  }
  if (__DEV__) {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  } else {
    await Purchases.setLogLevel(LOG_LEVEL.WARN);
  }
  if (configuredFor === null) {
    Purchases.configure({ apiKey, appUserID: authUserId });
  } else {
    await Purchases.logIn(authUserId);
  }
  configuredFor = authUserId;
}

export async function logOutRevenueCat(): Promise<void> {
  if (!isRevenueCatSupported() || configuredFor === null) {
    return;
  }
  try {
    await Purchases.logOut();
  } finally {
    configuredFor = null;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isRevenueCatSupported()) {
    return null;
  }
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export function findPackageForPlan(
  offering: PurchasesOffering | null,
  planId: RcPlanId
): PurchasesPackage | null {
  if (!offering) {
    return null;
  }
  const productIdentifier = RC_PRODUCT_IDENTIFIERS[planId];
  return (
    offering.availablePackages.find(
      (pkg) => pkg.product.identifier === productIdentifier
    ) ?? null
  );
}

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<
  { ok: true; customerInfo: CustomerInfo } | { ok: false; cancelled: boolean }
> {
  try {
    const result = await Purchases.purchasePackage(pkg);
    return { ok: true, customerInfo: result.customerInfo };
  } catch (err) {
    const cancelled =
      typeof err === "object" &&
      err !== null &&
      "userCancelled" in err &&
      (err as { userCancelled?: boolean }).userCancelled === true;
    if (cancelled) {
      return { ok: false, cancelled: true };
    }
    throw err;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isRevenueCatSupported()) {
    return null;
  }
  return await Purchases.restorePurchases();
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRevenueCatSupported()) {
    return null;
  }
  return await Purchases.getCustomerInfo();
}

export interface RcSyncPayload {
  entitlementActive: boolean;
  entitlementId?: string;
  expiresAt?: string;
  latestPurchaseAt?: string;
  originalAppUserId?: string;
  periodType?: "normal" | "trial" | "intro";
  productIdentifier?: string;
  rcAppUserId?: string;
  store?:
    | "app_store"
    | "play_store"
    | "stripe"
    | "promotional"
    | "mac_app_store"
    | "amazon";
  willRenew?: boolean;
}

function normalizeStore(store: string | undefined): RcSyncPayload["store"] {
  switch (store) {
    case "APP_STORE":
      return "app_store";
    case "PLAY_STORE":
      return "play_store";
    case "STRIPE":
      return "stripe";
    case "PROMOTIONAL":
      return "promotional";
    case "MAC_APP_STORE":
      return "mac_app_store";
    case "AMAZON":
      return "amazon";
    default:
      return;
  }
}

function normalizePeriod(
  period: string | undefined
): RcSyncPayload["periodType"] {
  switch (period) {
    case "NORMAL":
      return "normal";
    case "TRIAL":
      return "trial";
    case "INTRO":
      return "intro";
    default:
      return;
  }
}

export function mapCustomerInfoToSync(info: CustomerInfo): RcSyncPayload {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) {
    return {
      entitlementActive: false,
      rcAppUserId: info.originalAppUserId,
      originalAppUserId: info.originalAppUserId,
    };
  }
  return {
    entitlementActive: true,
    productIdentifier: entitlement.productIdentifier,
    entitlementId: entitlement.identifier,
    store: normalizeStore(entitlement.store),
    periodType: normalizePeriod(entitlement.periodType),
    willRenew: entitlement.willRenew,
    rcAppUserId: info.originalAppUserId,
    originalAppUserId: info.originalAppUserId,
    latestPurchaseAt: entitlement.latestPurchaseDate,
    expiresAt: entitlement.expirationDate ?? undefined,
  };
}

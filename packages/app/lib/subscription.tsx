import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CustomerInfo, PurchasesOffering } from "react-native-purchases";
import Purchases from "react-native-purchases";
import { useUser } from "@/contexts/user-context";
import {
  configureRevenueCatAnonymous,
  findPackageForPlan,
  getCustomerInfo,
  getOfferings,
  isRevenueCatSupported,
  linkRevenueCatToUser,
  mapCustomerInfoToSync,
  purchasePackage,
  type RcPlanId,
  restorePurchases,
} from "./revenuecat";

export type ProductId = RcPlanId;

export type PurchaseOutcome =
  | { ok: true; alreadyOwned: boolean }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; reason: string };

type ActiveSubscription = FunctionReturnType<
  typeof api.lib.subscriptions.getMySubscription
>;

interface Ctx {
  activeSubscription: ActiveSubscription | undefined;
  claimMockSubscription(planId: ProductId): Promise<void>;
  isPurchasing: boolean;
  isSubscriptionLoading: boolean;
  offerings: PurchasesOffering | null;
  offeringsLoading: boolean;
  purchase(planId: ProductId): Promise<PurchaseOutcome>;
  refresh(): Promise<void>;
  restore(): Promise<boolean>;
  revenueCatReady: boolean;
}

const SubscriptionContext = createContext<Ctx | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const activeSubscription = useQuery(api.lib.subscriptions.getMySubscription);
  const syncMutation = useMutation(
    api.lib.subscriptions.syncRevenueCatEntitlement
  );
  const claimMockMutation = useMutation(
    api.lib.subscriptions.claimMockSubscription
  );

  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [revenueCatReady, setRevenueCatReady] = useState(false);

  const syncCustomerInfo = useCallback(
    async (info: CustomerInfo) => {
      if (!user) {
        return;
      }
      await syncMutation(mapCustomerInfoToSync(info));
    },
    [syncMutation, user]
  );

  const syncCustomerInfoQuiet = useCallback(
    async (info: CustomerInfo) => {
      try {
        await syncCustomerInfo(info);
      } catch {
        // Passive listener path; user-initiated paths surface errors.
      }
    },
    [syncCustomerInfo]
  );

  const refresh = useCallback(async () => {
    if (!isRevenueCatSupported()) {
      return;
    }
    setOfferingsLoading(true);
    try {
      const current = await getOfferings();
      setOfferings(current);
      const info = await getCustomerInfo();
      if (info) {
        await syncCustomerInfoQuiet(info);
      }
    } finally {
      setOfferingsLoading(false);
    }
  }, [syncCustomerInfoQuiet]);

  useEffect(() => {
    if (!isRevenueCatSupported()) {
      setRevenueCatReady(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const ok = user
          ? await linkRevenueCatToUser(user._id)
          : await configureRevenueCatAnonymous();
        if (cancelled || !ok) {
          return;
        }
        setRevenueCatReady(true);
        if (user) {
          const info = await getCustomerInfo();
          if (info && !cancelled) {
            await syncCustomerInfo(info);
          }
        }
        await refresh();
      } catch {
        // Configuration failure leaves provider in query-only mode.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refresh, syncCustomerInfo]);

  useEffect(() => {
    if (!(revenueCatReady && isRevenueCatSupported())) {
      return;
    }
    const listener = (info: CustomerInfo) => {
      syncCustomerInfoQuiet(info).catch(() => undefined);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [revenueCatReady, syncCustomerInfoQuiet]);

  // Note: anonymous mode stays configured after logout; no teardown needed.

  const purchase = useCallback(
    async (planId: ProductId): Promise<PurchaseOutcome> => {
      if (isPurchasing) {
        return { ok: false, cancelled: false, reason: "in-flight" };
      }
      if (!isRevenueCatSupported()) {
        return { ok: false, cancelled: false, reason: "unsupported-platform" };
      }
      const pkg = findPackageForPlan(offerings, planId);
      if (!pkg) {
        return { ok: false, cancelled: false, reason: "package-unavailable" };
      }
      setIsPurchasing(true);
      try {
        const result = await purchasePackage(pkg);
        if (!result.ok) {
          return { ok: false, cancelled: true };
        }
        await syncCustomerInfo(result.customerInfo);
        const entitlement = result.customerInfo.entitlements.active.premium;
        const alreadyOwned = Boolean(
          entitlement &&
            entitlement.latestPurchaseDate !== entitlement.originalPurchaseDate
        );
        return { ok: true, alreadyOwned };
      } catch (err) {
        const reason = err instanceof Error ? err.message : "purchase-failed";
        return { ok: false, cancelled: false, reason };
      } finally {
        setIsPurchasing(false);
      }
    },
    [isPurchasing, offerings, syncCustomerInfo]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isRevenueCatSupported()) {
      return Boolean(activeSubscription);
    }
    const info = await restorePurchases();
    if (info) {
      await syncCustomerInfo(info);
      return Boolean(info.entitlements.active.premium);
    }
    return Boolean(activeSubscription);
  }, [activeSubscription, syncCustomerInfo]);

  const claimMockSubscription = useCallback(
    async (planId: ProductId) => {
      if (!__DEV__) {
        throw new Error("Mock subscription is dev-only");
      }
      await claimMockMutation({ productId: planId });
    },
    [claimMockMutation]
  );

  const isSubscriptionLoading = activeSubscription === undefined;

  const value = useMemo<Ctx>(
    () => ({
      activeSubscription,
      isSubscriptionLoading,
      isPurchasing,
      offerings,
      offeringsLoading,
      revenueCatReady,
      claimMockSubscription,
      purchase,
      restore,
      refresh,
    }),
    [
      activeSubscription,
      isSubscriptionLoading,
      isPurchasing,
      offerings,
      offeringsLoading,
      revenueCatReady,
      claimMockSubscription,
      purchase,
      restore,
      refresh,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}

import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CustomerInfo, PurchasesOffering } from "react-native-purchases";
import Purchases from "react-native-purchases";
import { useUser } from "@/contexts/user-context";
import {
  configureRevenueCat,
  findPackageForPlan,
  getCustomerInfo,
  getOfferings,
  isRevenueCatSupported,
  logOutRevenueCat,
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
  isPurchasing: boolean;
  isSubscriptionLoading: boolean;
  offerings: PurchasesOffering | null;
  offeringsLoading: boolean;
  purchase(planId: ProductId): Promise<PurchaseOutcome>;
  refresh(): Promise<void>;
  restore(): Promise<boolean>;
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

  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const isConfigured = useRef(false);

  const syncCustomerInfo = useCallback(
    async (info: CustomerInfo) => {
      try {
        await syncMutation(mapCustomerInfoToSync(info));
      } catch {
        // Sync errors are non-fatal; next listener call will retry.
      }
    },
    [syncMutation]
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
        await syncCustomerInfo(info);
      }
    } finally {
      setOfferingsLoading(false);
    }
  }, [syncCustomerInfo]);

  useEffect(() => {
    if (!(user && isRevenueCatSupported())) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await configureRevenueCat(user._id);
        if (cancelled) {
          return;
        }
        isConfigured.current = true;
        await refresh();
      } catch {
        // Configuration failure is non-fatal; UI falls back to query-only mode.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refresh]);

  useEffect(() => {
    if (!(isConfigured.current && isRevenueCatSupported())) {
      return;
    }
    const listener = (info: CustomerInfo) => {
      void syncCustomerInfo(info);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [syncCustomerInfo]);

  useEffect(() => {
    if (user) {
      return;
    }
    if (isConfigured.current) {
      void logOutRevenueCat().finally(() => {
        isConfigured.current = false;
      });
    }
  }, [user]);

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
        const alreadyOwned = Boolean(
          result.customerInfo.entitlements.active.premium &&
            result.customerInfo.entitlements.active.premium
              .latestPurchaseDate !==
              result.customerInfo.entitlements.active.premium
                .originalPurchaseDate
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

  const isSubscriptionLoading = activeSubscription === undefined;

  const value = useMemo<Ctx>(
    () => ({
      activeSubscription,
      isSubscriptionLoading,
      isPurchasing,
      offerings,
      offeringsLoading,
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

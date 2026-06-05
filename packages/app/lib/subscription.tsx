import { api } from "@barakah/core/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
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
  configureRevenueCatAnonymous,
  ENTITLEMENT_ID,
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
  const userId = user?._id;
  const activeSubscription = useQuery(api.lib.subscriptions.getMySubscription);
  const syncAction = useAction(api.lib.subscriptions.syncRevenueCatEntitlement);
  const claimMockMutation = useMutation(
    api.lib.subscriptions.claimMockSubscription
  );
  const claimPolarByEmail = useMutation(
    api.lib.subscriptions.claimPolarByEmail
  );

  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [revenueCatReady, setRevenueCatReady] = useState(false);

  // Link a web Polar purchase (anonymous checkout, keyed by email) to this
  // account once the user is known, so the link persists beyond the read-time
  // email fallback in getMySubscription.
  const claimedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId || claimedForRef.current === userId) {
      return;
    }
    claimedForRef.current = userId;
    claimPolarByEmail({}).catch(() => {
      claimedForRef.current = null;
    });
  }, [userId, claimPolarByEmail]);

  const syncCustomerInfo = useCallback(
    async (info: CustomerInfo) => {
      if (!userId) {
        return;
      }
      await syncAction({ ...mapCustomerInfoToSync(info) });
    },
    [syncAction, userId]
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
        const ok = userId
          ? await linkRevenueCatToUser(userId)
          : await configureRevenueCatAnonymous();
        if (cancelled || !ok) {
          return;
        }
        setRevenueCatReady(true);
        if (cancelled) {
          return;
        }
        // refresh() already fetches offerings + customer info and syncs the
        // entitlement; no separate getCustomerInfo/sync here (was a duplicate
        // round-trip + entitlement write on every login).
        await refresh();
      } catch {
        // Configuration failure leaves provider in query-only mode.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refresh]);

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
        try {
          await syncCustomerInfo(result.customerInfo);
        } catch {
          // Purchase succeeded; sync will retry via listener/refresh.
        }
        const entitlement =
          result.customerInfo.entitlements.active[ENTITLEMENT_ID];
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
      try {
        await syncCustomerInfo(info);
      } catch {
        // Entitlement is already confirmed below; the customer-info listener
        // retries the Convex sync. Don't let a sync hiccup report "nothing to
        // restore" for a purchase RevenueCat just confirmed.
      }
      return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
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

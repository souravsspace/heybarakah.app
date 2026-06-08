import { useQueryClient, useQuery as useRqQuery } from "@tanstack/react-query";
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
import { api } from "@/lib/api-client";
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

type ActiveSubscription = Record<string, unknown> | null;

type RcSyncInput = ReturnType<typeof mapCustomerInfoToSync>;

/**
 * The backend surface the provider needs, behind the cutover flag. Everything
 * else in this file (RevenueCat SDK offerings/listeners/purchase) is backend-
 * agnostic and stays shared, so only these four calls differ across §10.
 */
interface SubscriptionBackend {
  activeSubscription: ActiveSubscription | undefined;
  claimMock(productId: ProductId): Promise<void>;
  claimPolar(): Promise<void>;
  sync(input: RcSyncInput): Promise<void>;
}

const SUBSCRIPTION_QUERY_KEY = ["cf", "subscription"] as const;

function useSubscriptionBackend(): SubscriptionBackend {
  const queryClient = useQueryClient();
  const query = useRqQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: async (): Promise<ActiveSubscription> => {
      const res = await api.api.v1.subscription.$get();
      if (!res.ok) {
        throw new Error("Failed to load subscription");
      }
      return (await res.json()) as ActiveSubscription;
    },
  });

  return useMemo(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    return {
      activeSubscription: query.isPending
        ? undefined
        : ((query.data ?? null) as ActiveSubscription),
      // CF verifies the entitlement server-side via REVENUECAT_SECRET_KEY using
      // the session user — the client `customerInfo` is not sent.
      sync: async (_input: RcSyncInput) => {
        const res = await api.api.v1.subscription.revenuecat.$post();
        if (!res.ok) {
          throw new Error("Failed to sync entitlement");
        }
        invalidate();
      },
      claimMock: async (productId: ProductId) => {
        const res = await api.api.v1.subscription["claim-mock"].$post({
          json: { productId },
        });
        if (!res.ok) {
          throw new Error("Failed to claim mock subscription");
        }
        invalidate();
      },
      claimPolar: async () => {
        const res = await api.api.v1.subscription["claim-polar"].$post();
        if (!res.ok) {
          throw new Error("Failed to claim polar subscription");
        }
        invalidate();
      },
    };
  }, [query.data, query.isPending, queryClient]);
}

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
  const { activeSubscription, sync, claimMock, claimPolar } =
    useSubscriptionBackend();

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
    claimPolar().catch(() => {
      claimedForRef.current = null;
    });
  }, [userId, claimPolar]);

  const syncCustomerInfo = useCallback(
    async (info: CustomerInfo) => {
      if (!userId) {
        return;
      }
      await sync(mapCustomerInfoToSync(info));
    },
    [sync, userId]
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
      await claimMock(planId);
    },
    [claimMock]
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

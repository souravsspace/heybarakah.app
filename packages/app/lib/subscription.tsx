import { api } from "@barakah/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const STORAGE_KEY = "subscription-pending:v1";

export type ProductId = "yearly" | "monthly" | "family";

export type ClaimResult = "claimed" | "no-pending";

type ActiveSubscription = FunctionReturnType<
  typeof api.subscriptions.getMySubscription
>;

interface Ctx {
  activeSubscription: ActiveSubscription | undefined;
  claimPending(): Promise<ClaimResult>;
  clearPending(): Promise<void>;
  hydrated: boolean;
  isSubscriptionLoading: boolean;
  pending: ProductId | null;
  purchasePending(productId: ProductId): Promise<void>;
  restore(): Promise<boolean>;
}

const SubscriptionContext = createContext<Ctx | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<ProductId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const activeSubscription = useQuery(api.subscriptions.getMySubscription);
  const claimMutation = useMutation(api.subscriptions.claimMockSubscription);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { pending: unknown };
            const productId = parsed.pending;
            if (
              productId === "yearly" ||
              productId === "monthly" ||
              productId === "family"
            ) {
              setPending(productId);
            }
          } catch {
            // corrupt — keep null
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const purchasePending = useCallback(async (productId: ProductId) => {
    setPending(productId);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pending: productId })
    );
  }, []);

  const claimPending = useCallback(async (): Promise<ClaimResult> => {
    if (!pending) {
      return "no-pending";
    }
    await claimMutation({ productId: pending });
    setPending(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return "claimed";
  }, [pending, claimMutation]);

  const restore = useCallback(
    async () => Boolean(activeSubscription),
    [activeSubscription]
  );

  const clearPending = useCallback(async () => {
    setPending(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const isSubscriptionLoading = activeSubscription === undefined;

  const value = useMemo<Ctx>(
    () => ({
      activeSubscription,
      claimPending,
      clearPending,
      hydrated,
      isSubscriptionLoading,
      pending,
      purchasePending,
      restore,
    }),
    [
      activeSubscription,
      claimPending,
      clearPending,
      hydrated,
      isSubscriptionLoading,
      pending,
      purchasePending,
      restore,
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

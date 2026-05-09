import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "subscription:v2";

export type ProductId = "yearly" | "monthly" | "family";

export interface UserEntitlement {
  productId: ProductId;
  purchasedAt: string;
}

export interface SubscriptionState {
  emails: Record<string, UserEntitlement>;
  pending: ProductId | null;
}

const INITIAL: SubscriptionState = {
  pending: null,
  emails: {},
};

export type ClaimResult = "claimed" | "already-active" | "conflict" | "no-sub";

interface Ctx {
  claimPending(email: string): Promise<ClaimResult>;
  clear(): Promise<void>;
  hydrated: boolean;
  isActiveFor(email: string | null | undefined): boolean;
  purchasePending(productId: ProductId): Promise<void>;
  restore(email: string | null | undefined): Promise<boolean>;
  state: SubscriptionState;
}

const SubscriptionContext = createContext<Ctx | null>(null);

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SubscriptionState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as SubscriptionState;
            setState({ ...INITIAL, ...parsed });
          } catch {
            // corrupt — keep INITIAL
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const persist = useCallback(async (next: SubscriptionState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const purchasePending = useCallback(
    async (productId: ProductId) => {
      await persist({
        ...state,
        pending: productId,
      });
    },
    [persist, state]
  );

  const claimPending = useCallback(
    async (email: string): Promise<ClaimResult> => {
      const key = normalizeEmail(email);
      if (!key) {
        return "no-sub";
      }
      const hasPending = state.pending !== null;
      const hasEntitlement = Boolean(state.emails[key]);
      if (hasPending && hasEntitlement) {
        // User just paid but this email already had a sub.
        // Don't burn the pending purchase — keep it for a different account.
        return "conflict";
      }
      if (hasPending && state.pending) {
        const next: SubscriptionState = {
          pending: null,
          emails: {
            ...state.emails,
            [key]: {
              productId: state.pending,
              purchasedAt: new Date().toISOString(),
            },
          },
        };
        await persist(next);
        return "claimed";
      }
      if (hasEntitlement) {
        return "already-active";
      }
      return "no-sub";
    },
    [persist, state]
  );

  const isActiveFor = useCallback(
    (email: string | null | undefined) => {
      const key = normalizeEmail(email);
      if (!key) {
        return false;
      }
      return Boolean(state.emails[key]);
    },
    [state.emails]
  );

  const restore = useCallback(async (email: string | null | undefined) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }
    try {
      const parsed = JSON.parse(raw) as SubscriptionState;
      setState(parsed);
      const key = normalizeEmail(email);
      if (!key) {
        return false;
      }
      return Boolean(parsed.emails[key]);
    } catch {
      return false;
    }
  }, []);

  const clear = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(INITIAL);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      isActiveFor,
      purchasePending,
      claimPending,
      restore,
      clear,
    }),
    [
      state,
      hydrated,
      isActiveFor,
      purchasePending,
      claimPending,
      restore,
      clear,
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

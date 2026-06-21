import { useQuery as useRqQuery } from "@tanstack/react-query";
import type React from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { identifyUser } from "@/lib/analytics";
import { api } from "@/lib/api-client";

interface User {
  _id: string;
  email?: string;
  id: string;
  name?: string;
}

interface Profile {
  calcMethod?: string | null;
  locationGranted?: boolean | null;
  madhab?: string | null;
  name?: string | null;
  notifGranted?: boolean | null;
  [key: string]: unknown;
}

interface UserContextType {
  isLoading: boolean;
  // `undefined` while the account query is in flight, then the `users` row or
  // `null` once resolved — consumers gate on `undefined` for loading.
  profile: Profile | null | undefined;
  user: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}

interface CfAccount {
  profile: Profile | null;
  user: (User & { id: string }) | null;
}

const ACCOUNT_QUERY_KEY = ["cf", "me"] as const;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const query = useRqQuery({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: async (): Promise<CfAccount | null> => {
      const res = await api.api.v1.me.$get();
      if (!res.ok) {
        throw new Error("Failed to load account");
      }
      return (await res.json()) as CfAccount | null;
    },
  });

  const value = useMemo<UserContextType>(() => {
    const account = query.data;
    // Bridge `_id` from the Better Auth user id so Convex-era consumers
    // (`user?._id`) keep working unchanged across the cutover.
    const user =
      account?.user == null
        ? null
        : ({ ...account.user, _id: account.user.id } as unknown as User);
    return {
      user,
      profile: query.isPending ? undefined : (account?.profile ?? null),
      isLoading: query.isPending,
    };
  }, [query.data, query.isPending]);

  // Associate analytics events with the signed-in user once it resolves.
  // resetAnalytics() on logout (app/logging-out.tsx) clears this.
  const userId = value.user?.id;
  const userEmail = value.user?.email;
  const userName = value.user?.name;
  useEffect(() => {
    if (userId) {
      identifyUser(userId, {
        email: userEmail ?? null,
        name: userName ?? null,
      });
    }
  }, [userId, userEmail, userName]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

import { api as convexApi } from "@barakah/core/convex/_generated/api";
import { useQuery as useRqQuery } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { api } from "@/lib/api-client";
import { USE_CF_API } from "@/lib/cf-flag";

type Account = NonNullable<typeof convexApi.lib.users.getMyAccount._returnType>;
type User = Account["user"];
type Profile = Account["profile"];

interface UserContextType {
  isLoading: boolean;
  // `undefined` while the account query is in flight, then the `users` row or
  // `null` once resolved — consumers gate on `undefined` for loading.
  profile: Profile | undefined;
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

function UserProviderConvex({ children }: { children: React.ReactNode }) {
  const account = useQuery(convexApi.lib.users.getMyAccount);

  const value = useMemo<UserContextType>(
    () => ({
      user: account?.user ?? null,
      profile: account === undefined ? undefined : (account?.profile ?? null),
      isLoading: account === undefined,
    }),
    [account]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

interface CfAccount {
  profile: Profile | null;
  user: (User & { id: string }) | null;
}

const ACCOUNT_QUERY_KEY = ["cf", "me"] as const;

function UserProviderCf({ children }: { children: React.ReactNode }) {
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

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/** Selected at module load by the cutover flag (§10). */
export const UserProvider = USE_CF_API ? UserProviderCf : UserProviderConvex;

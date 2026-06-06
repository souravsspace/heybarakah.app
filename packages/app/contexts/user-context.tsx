import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import type React from "react";
import { createContext, useContext, useMemo } from "react";

type Account = NonNullable<typeof api.lib.users.getMyAccount._returnType>;
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const account = useQuery(api.lib.users.getMyAccount);

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

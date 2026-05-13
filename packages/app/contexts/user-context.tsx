import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import type React from "react";
import { createContext, useContext, useMemo } from "react";

type User = NonNullable<typeof api.lib.auth.getCurrentUser._returnType>;

interface UserContextType {
  isLoading: boolean;
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
  const queryResult = useQuery(api.lib.auth.getCurrentUser);

  const value = useMemo<UserContextType>(
    () => ({
      user: queryResult ?? null,
      isLoading: queryResult === undefined,
    }),
    [queryResult]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

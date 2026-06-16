import { useNetworkState } from "expo-network";
import type React from "react";
import { createContext, useContext, useMemo } from "react";

/**
 * App-wide connectivity source of truth. Wraps `expo-network` once at the root
 * so the gate, offline banner/overlay, and prayer-times hook all read the same
 * value instead of each subscribing to `useNetworkState` independently.
 *
 * `isConnected` is `undefined` until the first probe resolves; we treat that
 * optimistic-online (`!== false`) to avoid flashing offline UI on launch.
 */
const OnlineContext = createContext<boolean>(true);

export function OnlineProvider({ children }: { children: React.ReactNode }) {
  const network = useNetworkState();
  const isOnline = network.isConnected !== false;

  const value = useMemo(() => isOnline, [isOnline]);

  return (
    <OnlineContext.Provider value={value}>{children}</OnlineContext.Provider>
  );
}

export function useOnline(): boolean {
  return useContext(OnlineContext);
}

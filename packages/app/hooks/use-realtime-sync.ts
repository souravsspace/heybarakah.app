import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useUser } from "@/contexts/user-context";
import { SyncSocket } from "@/lib/sync-socket";

/**
 * Open the realtime sync channel while a user is signed in. Connects to the
 * user's SyncHub Durable Object and invalidates the matching React Query keys
 * whenever another device (or a server-side write) mutates their data — making
 * the whole app live-update like Convex did, on the Hono/Cloudflare backend.
 *
 * Re-runs on identity change so a logout tears the socket down and a new login
 * opens a fresh one bound to the new session cookie.
 */
export function useRealtimeSync(): void {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }
    const socket = new SyncSocket(queryClient);
    socket.start();
    return () => socket.stop();
  }, [userId, queryClient]);
}

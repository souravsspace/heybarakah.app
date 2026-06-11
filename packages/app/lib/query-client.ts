import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client for the Cloudflare API path (§10). Defaults follow
 * the §8 policy: long-ish staleness with refetch-on-focus (the focus manager is
 * wired in `_layout` via `@better-auth/expo`), and conservative retries so a
 * flaky mobile network doesn't hammer the API.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

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

// Resource segment (queryKey[1]) of the queries we persist to disk so the app
// renders last-known data offline / after a cold start. Prayer times are
// deliberately excluded — `prayer-storage.ts` already owns their disk cache and
// `usePrayerTimes` falls back to the local adhan-js calculation regardless.
const PERSIST_ALLOWLIST = new Set([
  "me",
  "subscription",
  "prayer-logs",
  "achievements",
  "dhikr",
  "shield",
]);

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "barakah-rq-cache/v1",
  throttleTime: 1000,
});

/**
 * Persist options consumed by `PersistQueryClientProvider` in `_layout`. Only
 * allowlisted, successfully-loaded queries are written to disk; bump `buster`
 * to discard every persisted cache after a breaking shape change.
 */
export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: asyncStoragePersister,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  buster: "v1",
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) &&
      PERSIST_ALLOWLIST.has(String(query.queryKey[1])),
  },
};

import type { AppType } from "@barakah/api";
import { hc } from "hono/client";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/cf-flag";

/**
 * Attach the Better Auth session. Native (`@better-auth/expo`) stores the
 * Set-Cookie and replays it via `getCookie()`; web relies on the credentialed
 * cookie travelling automatically. Mirrors the auth transport split in §4.
 */
function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (Platform.OS !== "web") {
    const cookie = (authClient as { getCookie?: () => string }).getCookie?.();
    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }
  return fetch(input, { ...init, headers, credentials: "include" });
}

/**
 * Typed Hono RPC client for the Cloudflare API. End-to-end types flow from
 * `@barakah/api`'s `AppType` (type-only import — erased at build, no worker
 * code enters the bundle). Routes live under `/api/v1`, so call as
 * `api.api.v1.<domain>...`.
 */
export const api = hc<AppType>(API_BASE_URL, { fetch: authedFetch });

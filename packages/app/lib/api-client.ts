import type { AppType } from "@barakah/api";
import { hc } from "hono/client";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/cf-flag";

// React Native's `fetch` has no built-in timeout: a stalled/half-open mobile
// connection (request sent, no response) leaves the promise pending forever.
// That keeps the React Query that drives app gating (`me`, `subscription`) in
// `isPending` and freezes the app on the loading splash. Abort after this so the
// query rejects → retries → falls back to cached/error instead of hanging.
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Attach the Better Auth session. Native (`@better-auth/expo`) stores the
 * Set-Cookie and replays it via `getCookie()`; web relies on the credentialed
 * cookie travelling automatically. Mirrors the auth transport split in §4.
 */
async function authedFetch(
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  // Honor a caller-supplied signal too, so React Query cancellations still abort.
  const callerSignal = init?.signal;
  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }
  try {
    return await fetch(input, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Typed Hono RPC client for the Cloudflare API. End-to-end types flow from
 * `@barakah/api`'s `AppType` (type-only import — erased at build, no worker
 * code enters the bundle). Routes live under `/api/v1`, so call as
 * `api.api.v1.<domain>...`.
 */
export const api = hc<AppType>(API_BASE_URL, { fetch: authedFetch });

import { createMiddleware } from "hono/factory";

import type { AppBindings } from "@/types/app-type";

/** Cached idempotent responses live for 24h (KV min TTL is 60s). */
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

/** Matches any non-printable-ASCII char; rejects unsafe Idempotency-Key values. */
const NON_PRINTABLE_ASCII = /[^\x20-\x7E]/;

interface StoredResponse {
  body: string;
  contentType: string;
  status: number;
}

/**
 * Idempotency-Key middleware. Mobile clients retry writes on flaky networks; a
 * repeated POST carrying the same `Idempotency-Key` replays the first response
 * from KV instead of re-applying the mutation. No-ops for non-POST requests or
 * when the header is absent. Only 2xx responses are cached, so a transient
 * client/server error (401/429/validation) can still be retried.
 */
export function idempotency() {
  return createMiddleware<AppBindings>(async (c, next) => {
    const key = c.req.header("Idempotency-Key");
    // Skip auth: replaying a cached body would drop the Set-Cookie header
    // (only body + content-type are stored), breaking sign-in on retry.
    if (c.req.method !== "POST" || !key || c.req.path.includes("/api/auth/")) {
      return next();
    }
    // Reject oversized / non-printable keys: the constructed KV key
    // (`idem:<scope>:<path>:<key>`) must stay under KV's 512-byte limit, else
    // KV.put throws and the client gets a 500 it can never replay past.
    if (key.length > 256 || NON_PRINTABLE_ASCII.test(key)) {
      return c.json({ error: "Invalid Idempotency-Key" }, 400);
    }

    // Authenticated callers scope by user id. Unauthenticated callers fall back
    // to the source IP so one anon client can't replay another's cached response
    // by reusing its Idempotency-Key on the same path.
    const userId = c.get("user")?.id;
    const scope = userId
      ? `u:${userId}`
      : `anon:${c.req.header("cf-connecting-ip") ?? "unknown"}`;
    const kvKey = `idem:${scope}:${c.req.path}:${key}`;

    const cached = await c.env.KV.get(kvKey);
    if (cached) {
      const stored = JSON.parse(cached) as StoredResponse;
      return c.body(stored.body, stored.status as 200, {
        "Content-Type": stored.contentType,
        "Idempotent-Replay": "true",
      });
    }

    await next();

    // Only cache 2xx: a transient 4xx/5xx (401/429/validation) must stay
    // retryable rather than being pinned to this key for 24h.
    if (c.res.status >= 200 && c.res.status < 300) {
      const body = await c.res.clone().text();
      const payload: StoredResponse = {
        status: c.res.status,
        body,
        contentType: c.res.headers.get("Content-Type") ?? "application/json",
      };
      await c.env.KV.put(kvKey, JSON.stringify(payload), {
        expirationTtl: IDEMPOTENCY_TTL_SECONDS,
      });
    }
  });
}

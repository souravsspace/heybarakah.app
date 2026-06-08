import { createMiddleware } from "hono/factory";

import type { AppBindings } from "@/types/app-type";

/** Cached idempotent responses live for 24h (KV min TTL is 60s). */
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

interface StoredResponse {
  body: string;
  contentType: string;
  status: number;
}

/**
 * Idempotency-Key middleware. Mobile clients retry writes on flaky networks; a
 * repeated POST carrying the same `Idempotency-Key` replays the first response
 * from KV instead of re-applying the mutation. No-ops for non-POST requests or
 * when the header is absent. Only successful responses (<500) are cached, so a
 * transient failure can still be retried.
 */
export function idempotency() {
  return createMiddleware<AppBindings>(async (c, next) => {
    const key = c.req.header("Idempotency-Key");
    if (c.req.method !== "POST" || !key) {
      return next();
    }

    const scope = c.get("user")?.id ?? "anon";
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

    if (c.res.status < 500) {
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

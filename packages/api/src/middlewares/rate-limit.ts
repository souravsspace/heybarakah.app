import type { MiddlewareHandler } from "hono";
import { TOO_MANY_REQUESTS } from "@/stoker/http-status-codes";
import type { AppBindings } from "@/types/app-type";

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  max?: number;
  /** Namespacing prefix so different routes can have independent budgets. */
  scope?: string;
  /** Window length in seconds. KV enforces a 60s minimum TTL. */
  windowSeconds?: number;
}

function clientKey(ip: string, scope: string, windowStart: number) {
  return `ratelimit:${scope}:${ip}:${windowStart}`;
}

/**
 * KV-backed fixed-window rate limiter, keyed per-IP. `window` is clamped to the
 * KV minimum of 60s. Per-user budgets land in §4 once the session resolver exists.
 */
export function rateLimit(
  options: RateLimitOptions = {}
): MiddlewareHandler<AppBindings> {
  const windowSeconds = Math.max(60, options.windowSeconds ?? 60);
  const max = options.max ?? 100;
  const scope = options.scope ?? "global";

  return async (c, next) => {
    // Only cf-connecting-ip is set by Cloudflare and cannot be spoofed by the
    // client; x-forwarded-for / x-real-ip are caller-controlled and would let a
    // client escape (or poison) a rate-limit bucket.
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";

    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % windowSeconds);
    const key = clientKey(ip, scope, windowStart);

    const current = Number((await c.env.KV.get(key)) ?? "0");
    if (current >= max) {
      return c.json({ error: "Too many requests" }, TOO_MANY_REQUESTS);
    }

    // TTL = time left in this window (KV floor 60s) — a flat windowSeconds TTL
    // kept late-window keys alive up to 2x the window after they became dead.
    await c.env.KV.put(key, String(current + 1), {
      expirationTtl: Math.max(60, windowStart + windowSeconds - now),
    });

    return next();
  };
}

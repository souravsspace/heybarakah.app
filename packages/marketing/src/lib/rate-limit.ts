type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export function rateLimit(key: string, opts: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count, retryAfter: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) {
      buckets.delete(k);
    }
  }
}, 60_000).unref?.();

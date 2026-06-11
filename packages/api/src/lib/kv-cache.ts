import type { KVNamespace } from "@cloudflare/workers-types";

/** KV enforces a 60s minimum on `expirationTtl`; shorter TTLs are clamped up. */
export const KV_MIN_TTL_SECONDS = 60;

export interface KVCache<T> {
  /** Delete a value. */
  del(key: string): Promise<void>;
  /** Read + JSON-parse a value, or null if missing/corrupt. */
  get(key: string): Promise<T | null>;
  /** JSON-stringify + write a value, optionally with a TTL (clamped to 60s). */
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;
}

/**
 * Typed wrapper over a KV namespace with key prefixing. Replaces the Convex
 * prayer-time cache's hot-path reads (see §6); the durable record stays in D1.
 * Reads never throw — a corrupt blob resolves to null so callers fall back to
 * the source of truth.
 */
export function createKVCache<T>(
  kv: KVNamespace,
  namespace: string
): KVCache<T> {
  const prefixed = (key: string) => `${namespace}:${key}`;

  return {
    async get(key) {
      const raw = await kv.get(prefixed(key));
      if (raw === null) {
        return null;
      }
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    async set(key, value, ttlSeconds) {
      const options =
        ttlSeconds === undefined
          ? undefined
          : { expirationTtl: Math.max(KV_MIN_TTL_SECONDS, ttlSeconds) };
      await kv.put(prefixed(key), JSON.stringify(value), options);
    },

    async del(key) {
      await kv.delete(prefixed(key));
    },
  };
}

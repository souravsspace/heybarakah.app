import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { createKVCache, KV_MIN_TTL_SECONDS } from "@/lib/kv-cache";

interface Payload {
  city: string;
  count: number;
}

describe("createKVCache", () => {
  it("round-trips a typed JSON value", async () => {
    const cache = createKVCache<Payload>(env.KV, "prayer");
    await cache.set("k1", { city: "Mecca", count: 5 });
    expect(await cache.get("k1")).toEqual({ city: "Mecca", count: 5 });
  });

  it("namespaces keys so different scopes never collide", async () => {
    const a = createKVCache<Payload>(env.KV, "scopeA");
    const b = createKVCache<Payload>(env.KV, "scopeB");
    await a.set("dup", { city: "A", count: 1 });
    await b.set("dup", { city: "B", count: 2 });
    expect(await a.get("dup")).toEqual({ city: "A", count: 1 });
    expect(await b.get("dup")).toEqual({ city: "B", count: 2 });
  });

  it("returns null for a missing key", async () => {
    const cache = createKVCache<Payload>(env.KV, "miss");
    expect(await cache.get("nope")).toBeNull();
  });

  it("deletes a stored value", async () => {
    const cache = createKVCache<Payload>(env.KV, "del");
    await cache.set("gone", { city: "X", count: 0 });
    await cache.del("gone");
    expect(await cache.get("gone")).toBeNull();
  });

  it("clamps the TTL to the KV 60s minimum", async () => {
    const cache = createKVCache<Payload>(env.KV, "ttl");
    // A sub-minimum TTL must not throw (KV rejects <60s); it is clamped.
    await expect(
      cache.set("short", { city: "Y", count: 1 }, 5)
    ).resolves.toBeUndefined();
    expect(KV_MIN_TTL_SECONDS).toBe(60);
  });

  it("returns null on a corrupt stored value instead of throwing", async () => {
    const cache = createKVCache<Payload>(env.KV, "corrupt");
    // Write a non-JSON blob under the namespaced key directly.
    await env.KV.put("corrupt:bad", "{not json");
    expect(await cache.get("bad")).toBeNull();
  });
});

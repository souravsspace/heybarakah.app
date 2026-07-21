import { beforeEach, describe, expect, mock, test } from "bun:test";

const store = new Map<string, string>();
let throwOnGet = false;

mock.module("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: (k: string) => {
      if (throwOnGet) {
        return Promise.reject(new Error("disk error"));
      }
      return Promise.resolve(store.get(k) ?? null);
    },
    setItem: (k: string, v: string) => {
      store.set(k, v);
      return Promise.resolve();
    },
  },
}));

const {
  cacheShieldSelection,
  loadCachedShieldSelection,
  UPSERT_ANDROID_KIND,
  UPSERT_IOS_KIND,
} = await import("@/lib/shield-selection-offline");

beforeEach(() => {
  store.clear();
  throwOnGet = false;
});

describe("shield-selection cache", () => {
  test("round-trips an arbitrary selection object", async () => {
    const selection = { windows: [{ start: 300, end: 316 }], tokens: ["a"] };
    await cacheShieldSelection(selection);
    expect(await loadCachedShieldSelection<typeof selection>()).toEqual(
      selection,
    );
  });

  test("returns null when nothing cached", async () => {
    expect(await loadCachedShieldSelection()).toBeNull();
  });

  test("returns null when the read throws", async () => {
    await cacheShieldSelection({ x: 1 });
    throwOnGet = true;
    expect(await loadCachedShieldSelection()).toBeNull();
  });

  test("mutation-kind constants are stable identifiers", () => {
    expect(UPSERT_IOS_KIND).toBe("shieldSelection.upsertIos");
    expect(UPSERT_ANDROID_KIND).toBe("shieldSelection.upsertAndroid");
  });
});

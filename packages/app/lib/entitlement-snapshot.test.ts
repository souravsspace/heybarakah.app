import { beforeEach, describe, expect, mock, test } from "bun:test";

const store = new Map<string, string>();

mock.module("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: (k: string) => Promise.resolve(store.get(k) ?? null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
      return Promise.resolve();
    },
    removeItem: (k: string) => {
      store.delete(k);
      return Promise.resolve();
    },
  },
}));

mock.module("react-native", () => ({
  AppState: { addEventListener: () => ({ remove: () => undefined }) },
}));

const {
  OFFLINE_SUB_GRACE_MS,
  readEntitlementSnapshot,
  saveEntitlementSnapshot,
  withinGrace,
} = await import("@/lib/entitlement-snapshot");

beforeEach(() => store.clear());

describe("saveEntitlementSnapshot + readEntitlementSnapshot", () => {
  test("round-trips a saved snapshot", async () => {
    await saveEntitlementSnapshot(true);
    const snap = await readEntitlementSnapshot();
    expect(snap?.active).toBe(true);
    expect(typeof snap?.ts).toBe("number");
  });

  test("read returns null when nothing stored", async () => {
    expect(await readEntitlementSnapshot()).toBeNull();
  });

  test("read returns null on malformed JSON", async () => {
    store.set("@barakah/entitlement-snapshot/v1", "{not json");
    expect(await readEntitlementSnapshot()).toBeNull();
  });

  test("read rejects a structurally invalid snapshot", async () => {
    store.set(
      "@barakah/entitlement-snapshot/v1",
      JSON.stringify({ active: "yes", ts: "later" })
    );
    expect(await readEntitlementSnapshot()).toBeNull();
  });

  test("saves the false state too", async () => {
    await saveEntitlementSnapshot(false);
    expect((await readEntitlementSnapshot())?.active).toBe(false);
  });
});

describe("withinGrace", () => {
  test("fresh snapshot is within grace", () => {
    expect(withinGrace({ active: true, ts: Date.now() })).toBe(true);
  });

  test("snapshot exactly at the grace boundary is still valid", () => {
    expect(
      withinGrace({ active: true, ts: Date.now() - OFFLINE_SUB_GRACE_MS })
    ).toBe(true);
  });

  test("snapshot past the grace window is invalid", () => {
    expect(
      withinGrace({
        active: true,
        ts: Date.now() - OFFLINE_SUB_GRACE_MS - 1000,
      })
    ).toBe(false);
  });

  test("grace window is 7 days", () => {
    expect(OFFLINE_SUB_GRACE_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

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

const { enqueueMutation, resetOfflineQueue } = await import(
  "@/lib/offline-queue"
);

const QUEUE_KEY = "@barakah/offline-queue/v1";

interface Op {
  args: Record<string, unknown>;
  id: string;
  kind: string;
  ts: number;
}

function readQueue(): Op[] {
  const raw = store.get(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as Op[]) : [];
}

beforeEach(async () => {
  await resetOfflineQueue();
  store.clear();
});

describe("enqueueMutation", () => {
  test("persists a mutation with kind, args, id and ts", async () => {
    await enqueueMutation("shieldSelection.upsertIos", { tokens: ["a"] });
    const queue = readQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].kind).toBe("shieldSelection.upsertIos");
    expect(queue[0].args).toEqual({ tokens: ["a"] });
    expect(typeof queue[0].id).toBe("string");
    expect(typeof queue[0].ts).toBe("number");
  });

  test("appends multiple ops preserving order", async () => {
    await enqueueMutation("a", { n: 1 });
    await enqueueMutation("b", { n: 2 });
    expect(readQueue().map((o) => o.kind)).toEqual(["a", "b"]);
  });

  test("assigns unique ids to each op", async () => {
    await enqueueMutation("a", {});
    await enqueueMutation("a", {});
    const [first, second] = readQueue();
    expect(first.id).not.toBe(second.id);
  });
});

describe("resetOfflineQueue", () => {
  test("clears persisted ops", async () => {
    await enqueueMutation("a", {});
    await resetOfflineQueue();
    expect(store.get(QUEUE_KEY)).toBeUndefined();
  });

  test("drops the in-memory mirror so a later enqueue starts fresh", async () => {
    await enqueueMutation("a", {});
    await enqueueMutation("b", {});
    await resetOfflineQueue();
    store.clear();
    await enqueueMutation("c", {});
    expect(readQueue().map((o) => o.kind)).toEqual(["c"]);
  });
});

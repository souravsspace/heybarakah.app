import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

const QUEUE_KEY = "@barakah/offline-queue/v1";

export interface QueuedMutation {
  args: Record<string, unknown>;
  id: string;
  kind: string;
  ts: number;
}

export type MutationHandler = (
  args: Record<string, unknown>
) => Promise<unknown>;

// In-memory mirror so rapid enqueues don't race on AsyncStorage reads, plus a
// serialized write chain so concurrent persists can't clobber each other.
let memo: QueuedMutation[] | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<QueuedMutation[]> {
  if (memo) {
    return memo;
  }
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    memo = raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    memo = [];
  }
  return memo;
}

function persist(next: QueuedMutation[]): Promise<void> {
  memo = next;
  writeChain = writeChain.then(() =>
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next)).catch(() => undefined)
  );
  return writeChain;
}

/**
 * Persist a mutation so it survives an app kill and is replayed once the device
 * is back online. Handlers must be idempotent — a replay may re-apply an op that
 * already committed (e.g. after a crash between commit and dequeue).
 */
export async function enqueueMutation(
  kind: string,
  args: Record<string, unknown>
): Promise<void> {
  const queue = await load();
  const op: QueuedMutation = {
    args,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind,
    ts: Date.now(),
  };
  await persist([...queue, op]);
}

async function removeMutation(id: string): Promise<void> {
  const queue = await load();
  await persist(queue.filter((op) => op.id !== id));
}

/**
 * Drains the persisted mutation queue on mount and whenever the app returns to
 * the foreground. Each handler resolves only once Convex confirms the write, so
 * while offline the loop simply waits — and resumes draining on reconnect.
 */
export function useOfflineReplay(handlers: Record<string, MutationHandler>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const draining = useRef(false);

  const drain = useCallback(async () => {
    if (draining.current) {
      return;
    }
    draining.current = true;
    try {
      const ops = await load();
      for (const op of ops) {
        const handler = handlersRef.current[op.kind];
        if (!handler) {
          await removeMutation(op.id);
          continue;
        }
        try {
          // Pends while offline; resolves when the server commits.
          await handler(op.args);
        } catch (err) {
          // A rejection is a server/validation error (network drops pend, not
          // reject), so retrying can never succeed — drop it to avoid a queue
          // that is permanently stuck behind one poison op. Surface it in dev
          // so a mismatched enqueue payload doesn't vanish silently.
          if (__DEV__) {
            console.warn(`[offline-queue] dropping op "${op.kind}":`, err);
          }
        }
        await removeMutation(op.id);
      }
    } finally {
      draining.current = false;
    }
  }, []);

  useEffect(() => {
    drain();
  }, [drain]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        drain();
      }
    });
    return () => sub.remove();
  }, [drain]);
}

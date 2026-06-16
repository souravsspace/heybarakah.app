import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

const STORAGE_KEY = "@barakah/entitlement-snapshot/v1";

/**
 * How long a last-known-active entitlement is trusted while the device stays
 * offline. After this window the gate stops honoring the cached entitlement and
 * forces an online recheck — so turning the network off forever can't grant
 * premium forever.
 */
export const OFFLINE_SUB_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export interface EntitlementSnapshot {
  active: boolean;
  ts: number;
}

function isSnapshot(value: unknown): value is EntitlementSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const snap = value as Record<string, unknown>;
  return typeof snap.active === "boolean" && typeof snap.ts === "number";
}

/**
 * Persist the entitlement state from a *real server answer* (online success).
 * Never call this on a network failure — a failed fetch must not overwrite the
 * last-known-good timestamp the grace window depends on.
 */
export async function saveEntitlementSnapshot(active: boolean): Promise<void> {
  try {
    const snapshot: EntitlementSnapshot = { active, ts: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Best-effort; gate falls back to splash/recheck if absent.
  }
}

export async function readEntitlementSnapshot(): Promise<EntitlementSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    return isSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function withinGrace(snapshot: EntitlementSnapshot): boolean {
  return Date.now() - snapshot.ts <= OFFLINE_SUB_GRACE_MS;
}

/**
 * Reads the persisted entitlement snapshot. Returns `undefined` while the first
 * disk read is in flight (consumers should hold a loading state on `undefined`),
 * then `null` (never seen) or the snapshot. Re-reads on app foreground so a
 * snapshot written during an online session is picked up next launch.
 */
export function useEntitlementSnapshot():
  | EntitlementSnapshot
  | null
  | undefined {
  const [snapshot, setSnapshot] = useState<
    EntitlementSnapshot | null | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      readEntitlementSnapshot()
        .then((value) => {
          if (!cancelled) {
            setSnapshot(value);
          }
        })
        .catch(() => undefined);
    };
    load();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        load();
      }
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return snapshot;
}

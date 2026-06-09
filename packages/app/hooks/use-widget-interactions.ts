import type { EventSubscription } from "expo-modules-core";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import { api } from "@/lib/api-client";
import { dateKey } from "@/lib/date-utils";

type IncrementFn = (date: string, by: number) => Promise<unknown>;

function useDhikrIncrement(): IncrementFn {
  return useCallback(async (date: string, by: number) => {
    const res = await api.api.v1.dhikr.increment.$post({ json: { date, by } });
    if (!res.ok) {
      throw new Error("Failed to increment dhikr");
    }
    return await res.json();
  }, []);
}

/**
 * Handles taps on interactive widgets. The Dhikr widget's increment button
 * fires a `{ source, target }` event through `expo-widgets`; we commit it to
 * Convex, and `useWidgetSync` re-pushes the updated snapshot reactively. This
 * replaces the old native `IncrementDhikrIntent` + pending-queue reconciliation.
 *
 * Note: delivery depends on the JS runtime being available when the tap is
 * handled; background/cold-start behavior must be verified on a device.
 */
export function useWidgetInteractions(): void {
  const increment = useDhikrIncrement();

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    let sub: EventSubscription | undefined;
    let cancelled = false;

    (async () => {
      const [{ addUserInteractionListener }, { DHIKR_INCREMENT_TARGET }] =
        await Promise.all([import("expo-widgets"), import("@/widgets")]);
      if (cancelled) {
        return;
      }
      sub = addUserInteractionListener((event) => {
        if (event.target === DHIKR_INCREMENT_TARGET) {
          increment(dateKey(), 1).catch(() => {
            // Offline or unauthenticated — the next sync reconciles the count.
          });
        }
      });
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [increment]);
}

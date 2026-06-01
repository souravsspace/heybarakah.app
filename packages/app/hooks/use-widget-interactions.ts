import { api } from "@barakah/core/convex/_generated/api";
import { useMutation } from "convex/react";
import type { EventSubscription } from "expo-modules-core";
import { useEffect } from "react";
import { Platform } from "react-native";
import { dateKey } from "@/lib/date-utils";

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
  const increment = useMutation(api.lib.dhikr.increment);

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
        if (__DEV__) {
          // TEMP probe: logs only if the JS runtime is alive when the widget is
          // tapped. A tap from the home screen with the app suspended that logs
          // nothing here ⇒ the increment must move to native. Remove once the
          // dhikr-tap path is verified end-to-end.
          console.log(`[widgets] interaction target=${event.target}`);
        }
        if (event.target === DHIKR_INCREMENT_TARGET) {
          increment({ date: dateKey(), by: 1 }).catch(() => {
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

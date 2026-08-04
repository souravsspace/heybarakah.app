import { addPushToStartTokenListener } from "expo-widgets";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { api } from "@/lib/api-client";

/**
 * Registers this install's APNs push-to-start token with the API.
 *
 * A Live Activity can only be raised from the foreground, so the salah banner
 * can never appear at adhan while the app is closed — and the one process iOS
 * does wake then, the DeviceActivityMonitor extension, is barred from
 * ActivityKit. Push-to-start is the only mechanism that works, and the server
 * needs this token to use it.
 *
 * Attaching the listener is also what starts the native token observer
 * (`OnStartObserving` in expo-widgets' WidgetsModule), so the token does not
 * flow at all until something mounts this hook.
 */
export function useLiveActivityPushToken(): void {
  // Last token handed to the API. iOS re-emits the same token on most launches;
  // without this the app would POST an unchanged value on every cold start.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    const sub = addPushToStartTokenListener((event) => {
      const token = event.activityPushToStartToken;
      if (!token || token === lastSent.current) {
        return;
      }
      lastSent.current = token;
      api.api.v1["live-activity"]["push-to-start-token"]
        .$post({ json: { token } })
        .catch(() => {
          // Offline or signed out. iOS re-emits the token on the next launch,
          // so clear the guard and let that attempt retry.
          lastSent.current = null;
        });
    });
    return () => sub.remove();
  }, []);
}

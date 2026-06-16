import { useIsRestoring } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import {
  type ErrorBoundaryProps,
  Redirect,
  Stack,
  usePathname,
  useRouter,
} from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { ErrorScreen } from "@/components/error-screen";
import { OfflineBanner } from "@/components/offline-banner";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { DhikrProvider } from "@/contexts/dhikr-context";
import { useUser } from "@/contexts/user-context";
import { useWidgetInteractions } from "@/hooks/use-widget-interactions";
import { useDailyAyahNotification } from "@/hooks/useDailyAyahNotification";
import { useLockActivityScheduler } from "@/hooks/useLockActivityScheduler";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { usePrayerShield } from "@/hooks/usePrayerShield";
import { useWidgetSync } from "@/hooks/useWidgetSync";
import {
  addPendingUnlockListener,
  checkAndClearPendingUnlock,
} from "@/lib/app-blocker";
import {
  useEntitlementSnapshot,
  withinGrace,
} from "@/lib/entitlement-snapshot";
import { useSubscription } from "@/lib/subscription";
import { useOnline } from "@/lib/use-online";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorScreen error={error} retry={retry} />;
}

function AuthedShell() {
  useDailyAyahNotification();
  useWidgetSync();
  useLockActivityScheduler();
  useWidgetInteractions();
  useOfflineSync();

  const { activeWindow } = usePrayerShield();
  const router = useRouter();
  const pathname = usePathname();
  const routedForWindowRef = useRef<string | null>(null);
  const initialNotificationHandledRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (!activeWindow) {
      routedForWindowRef.current = null;
      return;
    }
    if (routedForWindowRef.current === activeWindow) {
      return;
    }
    if (pathname?.endsWith("/unlock")) {
      routedForWindowRef.current = activeWindow;
      return;
    }
    routedForWindowRef.current = activeWindow;
    router.push("/(app)/unlock" as never);
  }, [activeWindow, pathname, router]);

  useEffect(() => {
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const link = response.notification.request.content.data?.link;
      if (typeof link !== "string" || link !== "unlock") {
        return;
      }
      if (pathnameRef.current?.endsWith("/unlock")) {
        return;
      }
      router.push("/(app)/unlock" as never);
    };

    if (!initialNotificationHandledRef.current) {
      initialNotificationHandledRef.current = true;
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (response) {
            handleResponse(response);
          }
        })
        .catch(() => null);
    }

    const sub =
      Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    const goToUnlock = () => {
      if (pathnameRef.current?.endsWith("/unlock")) {
        return;
      }
      router.push("/(app)/unlock" as never);
    };

    if (checkAndClearPendingUnlock()) {
      goToUnlock();
    }

    const sub = addPendingUnlockListener(goToUnlock);
    return () => sub?.remove();
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="achievements" />
        <Stack.Screen
          name="dhikr-record"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="unlock"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="prayer-logged"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
            gestureEnabled: false,
          }}
        />
      </Stack>
      <OfflineBanner />
    </View>
  );
}

export default function AppLayout() {
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();
  const isOnline = useOnline();
  const isRestoring = useIsRestoring();
  const snapshot = useEntitlementSnapshot();

  // Hold while the persisted query cache hydrates or the entitlement snapshot
  // loads from disk — deciding before these resolve would falsely treat a
  // returning, subscribed user as logged-out / unsubscribed.
  if (isRestoring || snapshot === undefined) {
    return <AnimatedSplash />;
  }
  // Online: wait for the live server truth. Offline: the persisted cache has
  // already hydrated, so `user`/`activeSubscription` reflect last-known state.
  if (isOnline && (isLoading || isSubscriptionLoading)) {
    return <AnimatedSplash />;
  }
  if (!user) {
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }

  // Online trusts the live entitlement. Offline trusts the last-known
  // entitlement (in-memory or restored from the persisted cache) but bounds it
  // by the snapshot's grace window so permanent airplane mode can't grant
  // premium forever. A missing snapshot (just subscribed this session, not yet
  // backgrounded) falls back to the live value rather than locking the user out.
  const subAllowed = isOnline
    ? Boolean(activeSubscription)
    : Boolean(activeSubscription) &&
      (snapshot === null || withinGrace(snapshot));

  if (!subAllowed) {
    return (
      <Redirect href={isOnline ? "/no-active-sub" : "/reconnect-required"} />
    );
  }

  return (
    <DhikrProvider>
      <AuthedShell />
    </DhikrProvider>
  );
}

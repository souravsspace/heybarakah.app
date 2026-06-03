import * as Notifications from "expo-notifications";
import { Redirect, Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AuthLoading } from "@/components/auth-loading";
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
import { useSubscription } from "@/lib/subscription";

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
    </Stack>
  );
}

export default function AppLayout() {
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();

  if (isLoading || isSubscriptionLoading) {
    return <AuthLoading />;
  }
  if (!user) {
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }
  if (!activeSubscription) {
    return <Redirect href="/no-active-sub" />;
  }

  return (
    <DhikrProvider>
      <AuthedShell />
    </DhikrProvider>
  );
}

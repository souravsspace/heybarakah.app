import "../global.css";

import {
  setupExpoFocusManager,
  setupExpoOnlineManager,
} from "@better-auth/expo/client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import {
  DefaultTheme,
  type ErrorBoundaryProps,
  Stack,
  ThemeProvider,
  usePathname,
} from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AchievementPopupProvider } from "@/components/achievement-popup-provider";
import { ErrorScreen } from "@/components/error-screen";
import { ForceUpdateGate } from "@/components/force-update-gate";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { ThemeProvider as BarakahThemeProvider } from "@/contexts/theme-context";
import { UserProvider } from "@/contexts/user-context";
import { OnboardingProvider } from "@/hooks/use-onboarding-state";
import { useOtaUpdates } from "@/hooks/use-ota-updates";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import {
  captureError,
  posthog,
  setupGlobalErrorTracking,
} from "@/lib/analytics";
import { persistOptions, queryClient } from "@/lib/query-client";
import { SubscriptionProvider } from "@/lib/subscription";
import { OnlineProvider } from "@/lib/use-online";
import { registerWidgets } from "@/lib/widgets-native";

// Drive React Query refetch-on-focus + online state from Expo (§8 policy).
setupExpoFocusManager();
setupExpoOnlineManager();

// Route uncaught JS errors to PostHog (no-op without a key).
setupGlobalErrorTracking();

preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: "index",
};

// Lives inside UserProvider + QueryClientProvider so it can read the signed-in
// user and the shared query cache. Opens the realtime sync socket; renders
// nothing.
function RealtimeSync() {
  useRealtimeSync();
  return null;
}

// Top-level catch-all: any render error in the app tree lands here instead of a
// native red box / crash. ErrorScreen is provider-free so it renders even when
// the failure is a provider itself.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    captureError(error, { source: "error_boundary" });
  }, [error]);
  return <ErrorScreen error={error} retry={retry} />;
}

// expo-router screen views: the RN SDK can't autocapture @react-navigation v7
// routes, so capture `$screen` ourselves on every pathname change.
function ScreenTracker() {
  const pathname = usePathname();
  useEffect(() => {
    posthog?.screen(pathname);
  }, [pathname]);
  return null;
}

// Reuses the shared client from lib/analytics so the provider's autocapture
// (screen views, taps, app lifecycle) and our manual events land on one
// instance. With no key configured `posthog` is null — render children plain.
function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (!posthog) {
    return children;
  }
  return (
    <PostHogProvider
      autocapture={{
        // expo-router rides @react-navigation v7; the SDK can't autocapture its
        // screens, so we disable it and track manually via <ScreenTracker/>.
        captureScreens: false,
        // Touch autocapture wraps the tree in a touch-intercepting View that can
        // conflict with react-native-gesture-handler and may capture
        // user-entered label text (PII). Manual captureEvent calls are cleaner.
        captureTouches: false,
      }}
      client={posthog}
      style={{ flex: 1 }}
    >
      <ScreenTracker />
      {children}
    </PostHogProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Variable.ttf"),
    "LibreBaskerville-Bold": require("../assets/fonts/LibreBaskerville-Bold.ttf"),
  });
  const [splashDone, setSplashDone] = useState(false);

  useOtaUpdates();

  useEffect(() => {
    if (fontsLoaded) {
      hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    registerWidgets().catch(() => undefined);
  }, []);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AnalyticsProvider>
        <OnlineProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={persistOptions}
          >
            <UserProvider>
              <RealtimeSync />
              <ThemeProvider value={DefaultTheme}>
                <SubscriptionProvider>
                  <OnboardingProvider>
                    <BarakahThemeProvider>
                      <AchievementPopupProvider>
                        <Stack
                          screenOptions={{
                            headerShown: false,
                          }}
                        >
                          <Stack.Screen name="index" />
                          <Stack.Screen name="(onboarding)" />
                          <Stack.Screen name="(account)" />
                          <Stack.Screen name="(app)" />
                          <Stack.Screen name="(settings)" />
                          <Stack.Screen
                            name="logging-out"
                            options={{
                              animation: "fade",
                              gestureEnabled: false,
                            }}
                          />
                          <Stack.Screen
                            name="modal"
                            options={{ presentation: "modal", title: "Modal" }}
                          />
                          <Stack.Screen
                            name="log-prayer"
                            options={{
                              presentation: "formSheet",
                              sheetAllowedDetents: [0.62, 0.95],
                              sheetInitialDetentIndex: 0,
                              sheetGrabberVisible: true,
                              sheetCornerRadius: 24,
                              sheetLargestUndimmedDetentIndex: "none",
                              gestureEnabled: true,
                              headerShown: false,
                              contentStyle: { backgroundColor: "#0E1311" },
                            }}
                          />
                        </Stack>
                        <StatusBar style="dark" />
                        {splashDone ? null : (
                          <AnimatedSplash onFinish={handleSplashFinish} />
                        )}
                        <ForceUpdateGate />
                      </AchievementPopupProvider>
                    </BarakahThemeProvider>
                  </OnboardingProvider>
                </SubscriptionProvider>
              </ThemeProvider>
            </UserProvider>
          </PersistQueryClientProvider>
        </OnlineProvider>
      </AnalyticsProvider>
    </GestureHandlerRootView>
  );
}

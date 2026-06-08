import "../global.css";

import { env } from "@barakah/env/app";
import {
  setupExpoFocusManager,
  setupExpoOnlineManager,
} from "@better-auth/expo/client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { useFonts } from "expo-font";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AchievementPopupProvider } from "@/components/achievement-popup-provider";
import { ForceUpdateGate } from "@/components/force-update-gate";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { ThemeProvider as BarakahThemeProvider } from "@/contexts/theme-context";
import { UserProvider } from "@/contexts/user-context";
import { OnboardingProvider } from "@/hooks/use-onboarding-state";
import { useOtaUpdates } from "@/hooks/use-ota-updates";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import { SubscriptionProvider } from "@/lib/subscription";
import { registerWidgets } from "@/lib/widgets-native";

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

// Drive React Query refetch-on-focus + online state from Expo (§8 policy).
// Harmless when the cutover flag is off — no CF queries are mounted.
setupExpoFocusManager();
setupExpoOnlineManager();

preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: "index",
};

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
      <QueryClientProvider client={queryClient}>
        <ConvexBetterAuthProvider authClient={authClient} client={convex}>
          <UserProvider>
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
        </ConvexBetterAuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

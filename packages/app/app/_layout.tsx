import "../global.css";

import { env } from "@barakah/env/app";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { ConvexReactClient } from "convex/react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { ThemeProvider as BarakahThemeProvider } from "@/contexts/theme-context";
import { UserProvider } from "@/contexts/user-context";
import { OnboardingProvider } from "@/hooks/use-onboarding-state";
import { authClient } from "@/lib/auth-client";
import { SubscriptionProvider } from "@/lib/subscription";

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Variable.ttf"),
    "LibreBaskerville-Bold": require("../assets/fonts/LibreBaskerville-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexBetterAuthProvider authClient={authClient} client={convex}>
        <UserProvider>
          <ThemeProvider value={DefaultTheme}>
            <SubscriptionProvider>
              <OnboardingProvider>
                <BarakahThemeProvider>
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
                </BarakahThemeProvider>
              </OnboardingProvider>
            </SubscriptionProvider>
          </ThemeProvider>
        </UserProvider>
      </ConvexBetterAuthProvider>
    </GestureHandlerRootView>
  );
}

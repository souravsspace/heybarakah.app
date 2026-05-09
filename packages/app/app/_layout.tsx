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
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#FFFFFF" },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(onboarding)" />
                  <Stack.Screen name="(account)" />
                  <Stack.Screen name="(app)" />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                  />
                </Stack>
                <StatusBar style="dark" />
              </OnboardingProvider>
            </SubscriptionProvider>
          </ThemeProvider>
        </UserProvider>
      </ConvexBetterAuthProvider>
    </GestureHandlerRootView>
  );
}

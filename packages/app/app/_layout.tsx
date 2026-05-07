import "../global.css";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { OnboardingProvider } from "@/hooks/use-onboarding-state";

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
    <ThemeProvider value={DefaultTheme}>
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
    </ThemeProvider>
  );
}

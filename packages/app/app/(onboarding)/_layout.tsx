import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function OnboardingLayout() {
  const { progress, back, index, currentPath } = useOnboardingNav();

  const focusedName = useNavigationState((state) => {
    if (!state) {
      return;
    }
    return state.routes[state.index]?.name;
  });
  const prevName = useNavigationState((state) => {
    if (!state) {
      return;
    }
    return state.routes[state.index - 1]?.name;
  });

  const [gestureToWelcome, setGestureToWelcome] = useState(false);

  const hideHeader =
    focusedName === "welcome" ||
    currentPath === "/(onboarding)/paywall/plans" ||
    gestureToWelcome ||
    index <= 0;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {hideHeader ? null : (
        <View className="h-[48px] flex-row items-center gap-sm px-md">
          <Pressable accessibilityLabel="Back" hitSlop={12} onPress={back}>
            <Ionicons color="#000000" name="chevron-back" size={26} />
          </Pressable>
          <View className="flex-1">
            <ProgressBar progress={progress} />
          </View>
          <View style={{ width: 26 }} />
        </View>
      )}
      <Stack
        screenListeners={{
          gestureStart: () => {
            if (prevName === "welcome") {
              setGestureToWelcome(true);
            }
          },
          gestureEnd: () => setGestureToWelcome(false),
          gestureCancel: () => setGestureToWelcome(false),
          transitionEnd: () => setGestureToWelcome(false),
        }}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        <Stack.Screen name="welcome" options={{ animation: "none" }} />
        <Stack.Screen
          name="problem"
          options={{ gestureEnabled: false, fullScreenGestureEnabled: false }}
        />
      </Stack>
    </SafeAreaView>
  );
}

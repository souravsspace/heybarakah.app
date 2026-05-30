import { Ionicons } from "@expo/vector-icons";
import { Redirect, Stack } from "expo-router";
import { useNavigationState } from "expo-router/react-navigation";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthLoading } from "@/components/auth-loading";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { useUser } from "@/contexts/user-context";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useSubscription } from "@/lib/subscription";

export default function OnboardingLayout() {
  const { progress, back, index, currentPath } = useOnboardingNav();
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();

  const focusedName = useNavigationState((state) => {
    if (!state) {
      return;
    }
    return state.routes[state.index]?.name;
  });
  const [gestureToWelcome, setGestureToWelcome] = useState(false);

  if (isLoading || isSubscriptionLoading) {
    return <AuthLoading />;
  }
  const isPaywallRoute = currentPath?.startsWith("/(onboarding)/paywall");
  const shouldRedirectHome = user && (activeSubscription || !isPaywallRoute);
  if (shouldRedirectHome) {
    return <Redirect href="/home" />;
  }

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

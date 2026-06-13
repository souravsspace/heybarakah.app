import { Ionicons } from "@expo/vector-icons";
import {
  type ErrorBoundaryProps,
  Redirect,
  Stack,
  useGlobalSearchParams,
} from "expo-router";
import { useNavigationState } from "expo-router/react-navigation";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorScreen } from "@/components/error-screen";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { POST_PURCHASE_FLOW } from "@/constants/onboarding-config";
import { useUser } from "@/contexts/user-context";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useSubscription } from "@/lib/subscription";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorScreen error={error} retry={retry} />;
}

export default function OnboardingLayout() {
  const { progress, back, index, currentPath } = useOnboardingNav();
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();
  // Global (not local) params: a layout otherwise won't see the child route's
  // `flow` query param, which would bounce a subscribed web buyer to /home.
  const params = useGlobalSearchParams<{ flow?: string }>();
  const isPostPurchase = params.flow === POST_PURCHASE_FLOW;

  const focusedName = useNavigationState((state) => {
    if (!state) {
      return;
    }
    return state.routes[state.index]?.name;
  });

  if (isLoading || isSubscriptionLoading) {
    return <AnimatedSplash />;
  }
  const isPaywallRoute = currentPath?.startsWith("/(onboarding)/paywall");
  // A web buyer signing in for the first time is subscribed but still needs the
  // post-purchase setup subset, so do not bounce them home mid-flow.
  const shouldRedirectHome =
    !isPostPurchase && user && (activeSubscription || !isPaywallRoute);
  if (shouldRedirectHome) {
    return <Redirect href="/home" />;
  }

  const hideHeader =
    focusedName === "welcome" ||
    currentPath === "/(onboarding)/paywall/plans" ||
    currentPath === "/(onboarding)/complete" ||
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
        <Stack.Screen
          name="complete"
          options={{ gestureEnabled: false, fullScreenGestureEnabled: false }}
        />
      </Stack>
    </SafeAreaView>
  );
}

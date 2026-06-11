import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

// Dev-only shortcut to wipe persisted onboarding state (including any stale
// purchase/paywall markers) and restart from welcome. Renders nothing in
// production builds.
export function DevResetOnboarding() {
  const router = useRouter();
  const { dispatch } = useOnboardingState();

  if (!__DEV__) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => {
        dispatch({ type: "RESET" });
        router.replace("/(onboarding)/welcome" as never);
      }}
      style={{ alignSelf: "center", paddingVertical: 8 }}
    >
      <Text
        className="font-sans text-caption text-tertiary"
        style={{ letterSpacing: 0.4, textDecorationLine: "underline" }}
      >
        DEV · reset onboarding
      </Text>
    </Pressable>
  );
}

import { Redirect } from "expo-router";
import { View } from "react-native";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Index() {
  const { state } = useOnboardingState();

  if (!state.hydrated) {
    return <View className="flex-1 bg-surface" />;
  }

  if (!state.completedAt) {
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }
  return <Redirect href="/home" />;
}

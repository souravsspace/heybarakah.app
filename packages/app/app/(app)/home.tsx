import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Home() {
  const { state, dispatch } = useOnboardingState();
  const router = useRouter();
  const name = state.name?.trim() || "friend";

  function reset() {
    dispatch({ type: "RESET" });
    router.replace("/(onboarding)/welcome");
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View
        className="flex-1 items-center justify-center px-md"
        style={{ gap: 14 }}
      >
        <Text
          className="text-center font-serif text-ink"
          style={{ fontSize: 28, lineHeight: 36 }}
        >
          Assalāmu ʿalaykum,{"\n"}
          {name}.
        </Text>
        <Text className="px-sm text-center font-sans text-body-sm text-tertiary">
          Your prayer-lock is active. Five times a day, in shāʾ Allāh.
        </Text>
        <View style={{ marginTop: 24, width: "100%" }}>
          <Button label="RESET ONBOARDING" onPress={reset} />
        </View>
      </View>
    </SafeAreaView>
  );
}

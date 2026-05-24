import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { authClient } from "@/lib/auth-client";

export default function LoggingOut() {
  const router = useRouter();
  const { dispatch } = useOnboardingState();

  useEffect(() => {
    (async () => {
      try {
        await authClient.signOut();
      } catch {
        // ignore
      }
      dispatch({ type: "RESET" });
      router.replace("/(onboarding)/welcome" as never);
    })();
  }, [dispatch, router]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View
        className="flex-1 items-center justify-center px-md"
        style={{ gap: 14 }}
      >
        <ActivityIndicator color="#29603E" size="large" />
        <Text className="font-sans text-body-sm text-tertiary">
          Logging out…
        </Text>
      </View>
    </SafeAreaView>
  );
}

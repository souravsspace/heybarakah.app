import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/lib/subscription";

export default function LoggingOut() {
  const { dispatch } = useOnboardingState();
  const { clearPending } = useSubscription();

  useEffect(() => {
    (async () => {
      try {
        await authClient.signOut();
      } catch {
        // ignore
      }
      await clearPending().catch(() => undefined);
      dispatch({ type: "RESET" });
    })();
  }, [clearPending, dispatch]);

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

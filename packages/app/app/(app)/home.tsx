import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function HomeScreen() {
  const { dispatch } = useOnboardingState();
  const router = useRouter();

  const handleReset = () => {
    dispatch({ type: "RESET" });
    router.replace("/(onboarding)/welcome" as never);
  };

  return (
    <View className="flex-1 items-center justify-center bg-white gap-6 px-6">
      <Text className="text-2xl font-serif text-black">hello world</Text>

      <Pressable
        onPress={handleReset}
        className="bg-[#29603E] px-6 py-3 rounded-lg active:opacity-80"
      >
        <Text className="text-white text-base font-sans">Reset onboarding</Text>
      </Pressable>
    </View>
  );
}

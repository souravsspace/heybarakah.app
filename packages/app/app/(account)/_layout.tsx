import { Ionicons } from "@expo/vector-icons";
import { Redirect, Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthLoading } from "@/components/auth-loading";
import { useUser } from "@/contexts/user-context";

export default function AccountLayout() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <AuthLoading />;
  }
  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-md" style={{ height: 48 }}>
        <Pressable
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
        >
          <Ionicons color="#0F1311" name="chevron-back" size={26} />
        </Pressable>
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      />
    </SafeAreaView>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, useSegments } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountLayout() {
  const router = useRouter();
  const segments = useSegments() as readonly string[];
  const last = segments.at(-1);
  const showBack = last !== "name";

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-md" style={{ height: 48 }}>
        {showBack ? (
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
        ) : null}
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

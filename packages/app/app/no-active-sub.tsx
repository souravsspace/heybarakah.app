import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { useUser } from "@/contexts/user-context";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/lib/subscription";

const PRIMARY = "#29603E";
const INK = "#0F1311";

export default function NoActiveSub() {
  const router = useRouter();
  const { user } = useUser();
  const { restore } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  async function backToAuth() {
    await authClient.signOut().catch(() => undefined);
    router.replace("/(account)/auth");
  }

  async function onRestore() {
    setIsRestoring(true);
    const ok = await restore(user?.email ?? null);
    setIsRestoring(false);
    if (ok) {
      router.replace("/home");
      return;
    }
    Alert.alert(
      "Nothing to restore",
      "We could not find an active subscription for this account."
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["bottom"]}>
      <View className="flex-row items-center px-md" style={{ height: 48 }}>
        <Pressable
          accessibilityLabel="Back to sign in"
          hitSlop={12}
          onPress={backToAuth}
        >
          <Ionicons color={INK} name="chevron-back" size={26} />
        </Pressable>
      </View>

      <View className="flex-1 px-md" style={{ paddingHorizontal: 24 }}>
        <FadeSlideIn className="flex-1">
          <View className="items-center" style={{ marginTop: 12 }}>
            <BarakahMark color={PRIMARY} size={64} />
          </View>

          <View
            className="items-center px-sm"
            style={{ marginTop: 28, gap: 8 }}
          >
            <Headline>No active subscription</Headline>
            <BodyText className="px-sm" size="sm" tone="muted">
              {user?.email
                ? `${user.email} does not have an active subscription. Choose a plan or restore a previous purchase.`
                : "Choose a plan or restore a previous purchase to continue."}
            </BodyText>
          </View>

          <View style={{ marginTop: 36, gap: 14 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(onboarding)/paywall/plans")}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View
                className="flex-row items-center justify-center"
                style={{
                  height: 60,
                  borderRadius: 18,
                  backgroundColor: PRIMARY,
                }}
              >
                <Text
                  className="font-sans"
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                  }}
                >
                  VIEW PLANS
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isRestoring}
              onPress={onRestore}
              style={({ pressed }) => ({
                opacity: pressed || isRestoring ? 0.92 : 1,
              })}
            >
              <View
                className="flex-row items-center justify-center bg-surface"
                style={{
                  height: 60,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: "#E5E7EB",
                }}
              >
                <Text
                  className="font-sans text-ink"
                  style={{ fontSize: 16, fontWeight: "600" }}
                >
                  {isRestoring ? "Restoring…" : "Restore purchase"}
                </Text>
                {isRestoring ? (
                  <ActivityIndicator
                    color={INK}
                    size="small"
                    style={{ marginLeft: 10 }}
                  />
                ) : null}
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={backToAuth}
              style={{ alignItems: "center", marginTop: 8 }}
            >
              <Text
                className="font-sans text-tertiary"
                style={{ fontSize: 13, textDecorationLine: "underline" }}
              >
                Use a different account
              </Text>
            </Pressable>
          </View>
        </FadeSlideIn>
      </View>
    </SafeAreaView>
  );
}

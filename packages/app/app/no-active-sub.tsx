import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/lib/subscription";

const PRIMARY = "#29603E";
const HAIRLINE = "#E5E7EB";

export default function NoActiveSub() {
  const router = useRouter();
  const { user } = useUser();
  const { restore } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  async function useDifferentAccount() {
    await authClient.signOut().catch(() => undefined);
    router.replace("/(account)/auth");
  }

  async function onRestore() {
    setIsRestoring(true);
    try {
      const ok = await restore();
      if (ok) {
        router.replace("/home");
        return;
      }
      Alert.alert(
        "Nothing to restore",
        "We could not find an active subscription for this account."
      );
    } catch {
      Alert.alert("Could not restore", "Check your connection and try again.");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <ScreenShell
      footer={
        <View className="gap-sm">
          <Button
            label="VIEW PLANS"
            onPress={() => router.push("/(onboarding)/paywall/plans")}
          />
          <Button
            disabled={isRestoring}
            label={isRestoring ? "Restoring…" : "Restore purchase"}
            onPress={onRestore}
            variant="secondary"
          />
          {isRestoring ? (
            <View
              className="items-center"
              pointerEvents="none"
              style={{ marginTop: -52, height: 0 }}
            >
              <ActivityIndicator color={PRIMARY} size="small" />
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={useDifferentAccount}
            style={{ alignItems: "center", marginTop: 8 }}
          >
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 13,
                textDecorationLine: "underline",
                letterSpacing: 0.2,
              }}
            >
              Use a different account
            </Text>
          </Pressable>
        </View>
      }
      scroll={false}
      topSafe
    >
      <FadeSlideIn className="flex-1">
        <View
          className="flex-1 items-center justify-center"
          style={{ gap: 24 }}
        >
          <BarakahMark color={PRIMARY} size={88} />

          <View className="items-center" style={{ gap: 10 }}>
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.4,
              }}
            >
              YOUR ACCOUNT
            </Text>
            {user?.email ? (
              <View
                className="rounded-full px-md"
                style={{
                  borderWidth: 1,
                  borderColor: HAIRLINE,
                  paddingVertical: 6,
                }}
              >
                <Text
                  className="font-sans text-ink"
                  style={{ fontSize: 13, fontWeight: "500" }}
                >
                  {user.email}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="items-center px-sm" style={{ gap: 12 }}>
            <Headline size="h2">No active subscription</Headline>
            <BodyText className="px-sm text-center" size="sm" tone="muted">
              Choose a plan to begin or restore a previous purchase.
            </BodyText>
          </View>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { temporaryUnlock } from "@/lib/app-blocker";

export default function Unlock() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/locked");
    }
  };

  const onUnlockFiveMin = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined
    );
    try {
      await temporaryUnlock(5);
    } finally {
      setBusy(false);
      close();
    }
  };

  return (
    <View style={{ backgroundColor: colors.bg, flex: 1 }}>
      <StatusBar
        style={
          Platform.OS === "ios" ? "light" : scheme === "dark" ? "light" : "dark"
        }
      />

      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 28,
          paddingTop: insets.top + 80,
        }}
      >
        <View style={{ gap: 12 }}>
          <View
            style={{ backgroundColor: colors.primary, height: 1, width: 28 }}
          />
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
            }}
          >
            QUIET LIFTED
          </Text>
        </View>

        <Text
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 36,
            letterSpacing: -0.6,
            lineHeight: 42,
            marginTop: 28,
          }}
        >
          Hold for du'a.
        </Text>
        <Text
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 36,
            fontStyle: "italic",
            letterSpacing: -0.6,
            lineHeight: 42,
          }}
        >
          Then return.
        </Text>

        <Text
          style={{
            color: colors.inkMuted,
            fontSize: 15,
            lineHeight: 24,
            marginTop: 20,
            maxWidth: 360,
          }}
        >
          Barakah quiets these apps for 15 minutes around each prayer. This
          pause is on purpose. Take a breath, then come back.
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          accessibilityRole="button"
          onPress={close}
          style={{
            alignItems: "center",
            backgroundColor: colors.primary,
            borderRadius: 14,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "600",
              letterSpacing: 0.2,
            }}
          >
            Continue with quiet
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onUnlockFiveMin}
          style={{
            alignItems: "center",
            marginTop: 14,
            opacity: busy ? 0.4 : 1,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            Unlock for 5 minutes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

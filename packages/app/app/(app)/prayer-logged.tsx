import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnlockMesh } from "@/components/meshes";
import { SuccessCheck } from "@/components/onboarding/illustrations/success-check";
import { useTheme } from "@/contexts/theme-context";
import { hapticNotification } from "@/lib/haptics";

const HOLD_MS = 2600;

const PRAYER_LABEL: Record<LoggablePrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const STATUS_LINE: Record<PrayerStatus, string> = {
  early: "Early — baarak Allāhu feek.",
  on_time: "On time, alhamdulillah.",
  late: "Logged. Return is always open.",
  qada: "Qadā recorded. Allah is the Most Forgiving.",
  missed: "Logged.",
};

function isPrayer(value: string | undefined): value is LoggablePrayerName {
  return (
    value === "fajr" ||
    value === "dhuhr" ||
    value === "asr" ||
    value === "maghrib" ||
    value === "isha"
  );
}

function isStatus(value: string | undefined): value is PrayerStatus {
  return (
    value === "early" ||
    value === "on_time" ||
    value === "late" ||
    value === "qada" ||
    value === "missed"
  );
}

export default function PrayerLogged() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ prayer?: string; status?: string }>();
  const prayer = isPrayer(params.prayer) ? params.prayer : null;
  const status = isStatus(params.status) ? params.status : "on_time";
  const doneRef = useRef(false);

  const bar = useSharedValue(1);
  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, bar.value) * 100}%`,
  }));

  const finish = useCallback(() => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    // Pop the unlock/celebration modals, then land on Home — Home and Progress
    // already re-read the week logs via React Query, so the new entry is live.
    if (router.canDismiss?.()) {
      router.dismissAll?.();
    }
    router.replace("/(app)/(tabs)/home");
  }, [router]);

  useEffect(() => {
    hapticNotification("success");
    bar.value = withTiming(0, { duration: HOLD_MS, easing: Easing.linear });
    const id = setTimeout(finish, HOLD_MS);
    return () => clearTimeout(id);
  }, [bar, finish]);

  return (
    <Pressable onPress={finish} style={{ backgroundColor: colors.bg, flex: 1 }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <UnlockMesh dark={scheme === "dark"} />

      <View
        style={{
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <Animated.View entering={FadeIn.duration(360)}>
          <SuccessCheck size={108} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(220).duration(420)}
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 30,
            lineHeight: 38,
            marginTop: 28,
            textAlign: "center",
          }}
        >
          {prayer ? `${PRAYER_LABEL[prayer]} logged` : "Prayer logged"}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(340).duration(420)}
          style={{
            color: colors.primary,
            fontSize: 15,
            fontWeight: "600",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {STATUS_LINE[status]}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(460).duration(420)}
          style={{
            color: colors.inkMuted,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 13,
            fontStyle: "italic",
            lineHeight: 22,
            marginTop: 24,
            maxWidth: 300,
            textAlign: "center",
          }}
        >
          "Establish prayer for My remembrance."
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(540).duration(420)}
          style={{
            color: colors.inkMuted,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.8,
            marginTop: 6,
            textTransform: "uppercase",
          }}
        >
          Qur'an 20:14
        </Animated.Text>
      </View>

      {/* Auto-dismiss countdown hairline */}
      <View
        style={{
          backgroundColor: colors.divider,
          height: 2,
          marginBottom: insets.bottom + 20,
          marginHorizontal: 32,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[{ backgroundColor: colors.primary, height: 2 }, barStyle]}
        />
      </View>
    </Pressable>
  );
}

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { PRESETS, useDhikr } from "./_layout";

export default function DhikrScreen() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    active,
    activeIndex,
    complete,
    count,
    increment,
    isLast,
    next,
    nextDhikr,
    totals,
  } = useDhikr();

  const progress = Math.min(1, count / active.target);
  const fillSv = useSharedValue(0);
  const pulseSv = useSharedValue(1);
  const longPressFired = useRef(false);

  useEffect(() => {
    fillSv.value = withTiming(progress, {
      duration: 280,
      easing: Easing.out(Easing.exp),
    });
  }, [progress, fillSv]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillSv.value * 100}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseSv.value }],
  }));

  const openRecord = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push("/dhikr/record");
  }, [router]);

  const onTap = useCallback(() => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (complete) {
      return;
    }
    pulseSv.value = withSequence(
      withTiming(1.04, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) })
    );
    increment();
  }, [complete, increment, pulseSv]);

  const onLongPress = useCallback(() => {
    longPressFired.current = true;
    openRecord();
  }, [openRecord]);

  const lifetimeActive = totals[active.id] ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.primarySoft,
          },
          fillStyle,
        ]}
      />

      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityLabel="Change dhikr"
          accessibilityRole="button"
          hitSlop={12}
          onPress={openRecord}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.6,
              color: colors.ink,
              textTransform: "uppercase",
            }}
          >
            {active.name}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 1.4,
              color: colors.inkSubtle,
              textTransform: "uppercase",
            }}
          >
            · {activeIndex + 1} of {PRESETS.length}
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.inkMuted,
            fontVariant: ["tabular-nums"],
            letterSpacing: 0.6,
          }}
        >
          {count} / {active.target}
        </Text>
      </View>

      <Pressable
        accessibilityLabel={`Count, ${count} of ${active.target}`}
        accessibilityRole="button"
        delayLongPress={500}
        onLongPress={onLongPress}
        onPress={onTap}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 96,
        }}
      >
        <View style={{ alignItems: "center", gap: 10, marginTop: 8 }}>
          <Text
            style={{
              fontSize: 32,
              lineHeight: 46,
              color: colors.ink,
              textAlign: "center",
              fontFamily: "Inter",
              fontWeight: "500",
            }}
          >
            {active.arabic}
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 18,
              lineHeight: 24,
              color: colors.ink,
              textAlign: "center",
              letterSpacing: 0.2,
              fontStyle: "italic",
              fontWeight: "500",
            }}
          >
            {active.phonetic}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.inkMuted,
              textAlign: "center",
              letterSpacing: 0.4,
            }}
          >
            {active.meaning}
          </Text>
        </View>

        <View style={{ alignItems: "center", gap: 4 }}>
          {complete ? (
            <>
              <Text
                style={{
                  fontFamily: "LibreBaskerville-Bold",
                  fontSize: 44,
                  lineHeight: 52,
                  color: colors.primary,
                  textAlign: "center",
                }}
              >
                Mashā Allāh
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.inkMuted,
                  marginTop: 2,
                }}
              >
                {active.target} complete
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={nextDhikr}
                style={({ pressed }) => ({
                  marginTop: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    letterSpacing: 1.6,
                    color: colors.primary,
                    textTransform: "uppercase",
                  }}
                >
                  {isLast
                    ? "Session complete · Start over"
                    : `Next · ${next.name} →`}
                </Text>
              </Pressable>
            </>
          ) : (
            <Animated.View style={[{ alignItems: "center" }, pulseStyle]}>
              <Text
                style={{
                  fontFamily: "LibreBaskerville-Bold",
                  fontSize: 132,
                  lineHeight: 140,
                  color: colors.ink,
                  fontVariant: ["tabular-nums"],
                  textAlign: "center",
                }}
              >
                {count}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.inkMuted,
                  fontVariant: ["tabular-nums"],
                  marginTop: -4,
                }}
              >
                of {active.target}
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={{ alignItems: "center", gap: 4, marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 9,
              fontWeight: "700",
              letterSpacing: 1.8,
              color: colors.inkSubtle,
              textTransform: "uppercase",
            }}
          >
            Lifetime · {active.short}{" "}
            <Text
              style={{
                color: colors.ink,
                fontVariant: ["tabular-nums"],
              }}
            >
              {lifetimeActive.toLocaleString()}
            </Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

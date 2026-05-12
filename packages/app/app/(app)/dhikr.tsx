import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { useTheme } from "@/contexts/theme-context";

interface Preset {
  arabic: string;
  id: string;
  meaning: string;
  target: number;
  translit: string;
}

const PRESETS: Preset[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ ٱللَّٰه",
    translit: "Subḥān Allāh",
    meaning: "Glory be to Allah",
    target: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰه",
    translit: "Al-ḥamdu lillāh",
    meaning: "All praise is for Allah",
    target: 33,
  },
  {
    id: "allahuakbar",
    arabic: "ٱللَّٰهُ أَكْبَر",
    translit: "Allāhu akbar",
    meaning: "Allah is the greatest",
    target: 34,
  },
  {
    id: "lailaha",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰه",
    translit: "Lā ilāha illā Allāh",
    meaning: "There is no god but Allah",
    target: 100,
  },
];

export default function Dhikr() {
  const [activeId, setActiveId] = useState(PRESETS[0].id);
  const [count, setCount] = useState(0);
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const active = useMemo(
    () => PRESETS.find((p) => p.id === activeId) ?? PRESETS[0],
    [activeId]
  );

  useEffect(() => {
    setCount(0);
  }, [activeId]);

  const progress = Math.min(1, count / active.target);
  const complete = count >= active.target;

  const tap = useCallback(() => {
    Haptics.impactAsync(
      complete
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => undefined);
    setCount((c) => c + 1);
  }, [complete]);

  const reset = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setCount(0);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            Tasbih
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              lineHeight: 34,
              color: colors.ink,
            }}
          >
            Remember Him.
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flexDirection: "row",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {PRESETS.map((p) => {
            const on = p.id === activeId;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => undefined);
                  setActiveId(p.id);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: on ? colors.primary : colors.border,
                  backgroundColor: on ? colors.primarySoft : colors.card,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: on ? colors.primary : colors.ink,
                  }}
                >
                  {p.translit}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 42,
              lineHeight: 56,
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
              marginTop: 6,
              fontSize: 14,
              color: colors.inkMuted,
              textAlign: "center",
            }}
          >
            {active.meaning}
          </Text>
        </View>

        <Pressable
          onPress={tap}
          style={({ pressed }) => ({
            marginTop: 32,
            marginHorizontal: 24,
            borderRadius: 999,
            aspectRatio: 1,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
        >
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              bottom: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
            }}
          />
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            Tap to count
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              color: "#FFFFFF",
              fontSize: 120,
              lineHeight: 130,
              fontVariant: ["tabular-nums"],
            }}
          >
            {count}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontVariant: ["tabular-nums"],
            }}
          >
            of {active.target}
          </Text>
        </Pressable>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            height: 4,
            borderRadius: 999,
            backgroundColor: colors.neutralSoft,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.inkMuted,
              fontVariant: ["tabular-nums"],
            }}
          >
            {count >= active.target
              ? "Mashā Allāh, complete."
              : `${active.target - count} remaining`}
          </Text>
          <Pressable
            onPress={reset}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: colors.ink }}
            >
              Reset
            </Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}

import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AreaChart } from "@/components/area-chart";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { useTheme } from "@/contexts/theme-context";

const WEEK = [
  { label: "Mon", value: 4 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 5 },
];

const PRAYER_BREAKDOWN = [
  { name: "Fajr", value: 5, of: 7 },
  { name: "Dhuhr", value: 7, of: 7 },
  { name: "Asr", value: 6, of: 7 },
  { name: "Maghrib", value: 7, of: 7 },
  { name: "Isha", value: 6, of: 7 },
];

function segmentedBlocks(value: number, of: number): boolean[] {
  const blocks: boolean[] = [];
  for (let i = 0; i < of; i++) {
    blocks.push(i < value);
  }
  return blocks;
}

export default function Progress() {
  const total = WEEK.reduce((s, d) => s + d.value, 0);
  const possible = WEEK.length * 5;
  const pct = Math.round((total / possible) * 100);
  const streak = 12;
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

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
            Progress
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              lineHeight: 34,
              color: colors.ink,
            }}
          >
            This week.
          </Text>
        </View>

        {/* Hero metric card */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 28,
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            On-time prayers
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 52,
              lineHeight: 58,
              color: colors.ink,
              fontVariant: ["tabular-nums"],
            }}
          >
            {pct}%
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.inkMuted,
              marginTop: 2,
            }}
          >
            {total} of {possible} prayers this week
          </Text>
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: colors.primarySoft,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.primary,
              }}
            >
              {streak}-day streak · mā shāʾ Allāh
            </Text>
          </View>
        </View>

        {/* Daily prayers chart */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 16,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Daily prayers
            </Text>
            <Text style={{ fontSize: 11, color: colors.inkMuted }}>
              last 7 days
            </Text>
          </View>
          <AreaChart
            data={WEEK}
            fill={colors.primary}
            max={5}
            stroke={colors.primary}
          />
        </View>

        {/* By prayer — segmented block bars */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            By prayer
          </Text>
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              overflow: "hidden",
            }}
          >
            {PRAYER_BREAKDOWN.map((p, i) => {
              const blocks = segmentedBlocks(p.value, p.of);
              return (
                <View
                  key={p.name}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.divider,
                  }}
                >
                  <View style={{ gap: 8 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.ink,
                      }}
                    >
                      {p.name}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {blocks.map((filled, bi) => (
                        <View
                          key={bi}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            backgroundColor: filled
                              ? colors.primary
                              : colors.inkSubtle,
                            opacity: filled ? 1 : 0.35,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.primary,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {p.value}/{p.of}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}

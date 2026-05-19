import type { Achievement } from "@barakah/core/achievements";
import { api } from "@barakah/core/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AchievementCard } from "@/components/achievement-card";
import { AchievementDetailSheet } from "@/components/achievement-detail-sheet";
import { AchievementsMesh } from "@/components/meshes";
import { useTheme } from "@/contexts/theme-context";

type Row = Achievement & { unlockedAt: number | null };

export default function AchievementsScreen() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const data = useQuery(api.lib.achievements.listForMe, {});
  const [selected, setSelected] = useState<Row | null>(null);

  const rows = useMemo<Row[]>(() => data?.items ?? [], [data?.items]);
  const unlockedCount = data?.unlockedCount ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const progress = totalCount > 0 ? unlockedCount / totalCount : 0;

  const pairs = useMemo(() => {
    const out: [Row, Row | null][] = [];
    for (let i = 0; i < rows.length; i += 2) {
      out.push([rows[i], rows[i + 1] ?? null]);
    }
    return out;
  }, [rows]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: scheme === "dark" ? "#0E1311" : "#F8FAF8",
      }}
    >
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <AchievementsMesh dark={scheme === "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? scheme === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)"
                : "transparent",
            })}
          >
            <Ionicons color={colors.ink} name="chevron-back" size={22} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: colors.inkSubtle,
              }}
            >
              Practice
            </Text>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 18,
                lineHeight: 22,
                color: colors.ink,
              }}
            >
              Achievements
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 4, gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.4,
                color: colors.inkMuted,
              }}
            >
              Your path
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.inkSubtle,
                fontVariant: ["tabular-nums"],
              }}
            >
              {`${unlockedCount} of ${totalCount}`}
            </Text>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: colors.divider,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 1,
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 22,
            gap: 12,
          }}
        >
          {pairs.map(([left, right]) => (
            <View key={left.code} style={{ flexDirection: "row", gap: 12 }}>
              <AchievementCard
                icon={left.icon}
                onPress={() => setSelected(left)}
                tier={left.tier}
                title={left.title}
                unlocked={left.unlockedAt !== null}
                unlockedAt={left.unlockedAt}
              />
              {right ? (
                <AchievementCard
                  icon={right.icon}
                  onPress={() => setSelected(right)}
                  tier={right.tier}
                  title={right.title}
                  unlocked={right.unlockedAt !== null}
                  unlockedAt={right.unlockedAt}
                />
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 18,
              color: colors.inkSubtle,
              textAlign: "center",
            }}
          >
            Practice, not performance.
          </Text>
        </View>
      </ScrollView>

      <AchievementDetailSheet
        ctaLabel="Close"
        description={selected?.description ?? ""}
        icon={selected?.icon ?? "trophy-outline"}
        onClose={() => setSelected(null)}
        quote={selected?.quote}
        title={selected?.title ?? ""}
        unlocked={Boolean(selected?.unlockedAt)}
        unlockedAt={selected?.unlockedAt ?? null}
        visible={selected !== null}
      />
    </View>
  );
}

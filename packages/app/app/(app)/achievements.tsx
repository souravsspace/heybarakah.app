import type {
  Achievement,
  AchievementCategory,
} from "@barakah/core/achievements";
import { api } from "@barakah/core/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AchievementCard } from "@/components/achievement-card";
import { AchievementDialog } from "@/components/achievement-dialog";
import { useTheme } from "@/contexts/theme-context";

type Row = Achievement & {
  progress: { current: number; target: number; unit: string } | null;
  unlockedAt: number | null;
};

const CATEGORY_ORDER: readonly AchievementCategory[] = [
  "beginnings",
  "salah",
  "continuity",
  "fajr",
  "night",
  "remembrance",
  "mercy",
  "seasons",
  "reflection",
];

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  beginnings: "Beginnings",
  salah: "Salah",
  continuity: "Continuity",
  fajr: "Fajr",
  night: "Night",
  remembrance: "Remembrance",
  mercy: "Mercy",
  seasons: "Seasons",
  reflection: "Reflection",
};

export default function AchievementsScreen() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const data = useQuery(api.lib.achievements.listForMe, {});
  const [selected, setSelected] = useState<Row | null>(null);

  const rows = useMemo<Row[]>(() => data?.items ?? [], [data?.items]);
  const unlockedCount = data?.unlockedCount ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const grouped = useMemo(() => {
    const map = new Map<AchievementCategory, Row[]>();
    for (const row of rows) {
      const list = map.get(row.category) ?? [];
      list.push(row);
      map.set(row.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => {
      const list = map.get(c) ?? [];
      const unlocked = list.filter((r) => r.unlockedAt !== null).length;
      return { category: c, items: list, unlocked, total: list.length };
    });
  }, [rows]);

  const selectedCategoryStats = useMemo(() => {
    if (!selected) {
      return;
    }
    const section = grouped.find((g) => g.category === selected.category);
    if (!section) {
      return;
    }
    return { unlocked: section.unlocked, total: section.total };
  }, [selected, grouped]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: scheme === "dark" ? "#0E1311" : "#F8FAF8",
      }}
    >
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
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
          <View style={{ width: 36 }} />
        </View>

        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 22,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 14,
          }}
        >
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 48,
              lineHeight: 52,
              color: colors.ink,
              fontVariant: ["tabular-nums"],
            }}
          >
            {unlockedCount}
          </Text>
          <View style={{ flex: 1, paddingBottom: 6 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.inkMuted,
                fontVariant: ["tabular-nums"],
              }}
            >
              {`of ${totalCount} unlocked`}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.inkSubtle,
                marginTop: 2,
              }}
            >
              Practice, not performance.
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginHorizontal: 20,
          }}
        />

        <View style={{ gap: 26, paddingTop: 22 }}>
          {grouped.map((section) => (
            <View key={section.category} style={{ gap: 10 }}>
              <View
                style={{
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: colors.inkSubtle,
                  }}
                >
                  {CATEGORY_LABEL[section.category]}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    color: colors.inkSubtle,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {`${section.unlocked} / ${section.total}`}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 20, gap: 8 }}>
                {section.items.map((row) => (
                  <AchievementCard
                    icon={row.icon}
                    key={row.code}
                    onPress={() => setSelected(row)}
                    progress={row.progress}
                    tier={row.tier}
                    title={row.title}
                    unlocked={row.unlockedAt !== null}
                    unlockedAt={row.unlockedAt}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <AchievementDialog
        category={selected?.category ?? "beginnings"}
        categoryStats={selectedCategoryStats}
        description={selected?.description ?? ""}
        icon={selected?.icon ?? "trophy-outline"}
        mode={selected?.unlockedAt ? "unlocked" : "locked"}
        onClose={() => setSelected(null)}
        progress={selected?.progress ?? undefined}
        quote={selected?.quote}
        tier={selected?.tier ?? "bronze"}
        title={selected?.title ?? ""}
        unlockedAt={selected?.unlockedAt ?? null}
        visible={selected !== null}
      />
    </View>
  );
}

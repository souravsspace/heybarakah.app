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
import { AchievementsMesh } from "@/components/meshes";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

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

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatStamp(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()} · ${d.getFullYear()}`;
}

function Rosette({
  color,
  trackColor,
  width = 160,
}: {
  color: string;
  trackColor: string;
  width?: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        width,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: trackColor }} />
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
        }}
      />
      <View style={{ flex: 1, height: 1, backgroundColor: trackColor }} />
    </View>
  );
}

function BeadRow({
  unlocked,
  total,
  colors,
}: {
  colors: ThemeColors;
  total: number;
  unlocked: number;
}) {
  const beads = Array.from({ length: total }, (_, i) => i < unlocked);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      {beads.map((on, i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: on ? colors.primary : "transparent",
            borderWidth: on ? 0 : 1,
            borderColor: colors.border,
          }}
        />
      ))}
    </View>
  );
}

export default function AchievementsScreen() {
  const { colors, scheme } = useTheme();
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();
  const data = useQuery(api.lib.achievements.listForMe, {});
  const [selected, setSelected] = useState<Row | null>(null);

  const rows = useMemo<Row[]>(() => data?.items ?? [], [data?.items]);
  const unlockedCount = data?.unlockedCount ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const mostRecent = useMemo<Row | null>(() => {
    let best: Row | null = null;
    for (const row of rows) {
      if (row.unlockedAt === null) {
        continue;
      }
      if (best === null || (row.unlockedAt ?? 0) > (best.unlockedAt ?? 0)) {
        best = row;
      }
    }
    return best;
  }, [rows]);

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

  const heroTrack = isDark ? "rgba(255,255,255,0.14)" : "rgba(41,96,62,0.22)";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0E1311" : "#F8F1E1",
      }}
    >
      <AchievementsMesh dark={isDark} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 6,
          paddingBottom: insets.bottom + 56,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 4,
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
                ? isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)"
                : "transparent",
            })}
          >
            <Ionicons color={colors.ink} name="chevron-back" size={22} />
          </Pressable>
          <Text
            style={{
              fontSize: 11,
              fontStyle: "italic",
              color: colors.inkSubtle,
            }}
          >
            Your ledger
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <Pressable
          accessibilityLabel={
            mostRecent
              ? `Most recent unlock: ${mostRecent.title}`
              : "Your ledger begins"
          }
          accessibilityRole="button"
          disabled={!mostRecent}
          onPress={() => {
            if (mostRecent) {
              setSelected(mostRecent);
            }
          }}
          style={({ pressed }) => ({
            paddingHorizontal: 32,
            paddingTop: 36,
            paddingBottom: 8,
            alignItems: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ alignSelf: "center" }}>
            <Rosette
              color={colors.primary}
              trackColor={heroTrack}
              width={180}
            />
          </View>

          <Text
            style={{
              marginTop: 22,
              alignSelf: "center",
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 34,
              lineHeight: 40,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            {mostRecent?.title ?? "Begin where you are"}
          </Text>

          {mostRecent?.unlockedAt ? (
            <Text
              style={{
                marginTop: 12,
                alignSelf: "center",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.4,
                color: colors.primary,
                fontVariant: ["tabular-nums"],
              }}
            >
              {formatStamp(mostRecent.unlockedAt).toUpperCase()}
            </Text>
          ) : (
            <Text
              style={{
                marginTop: 12,
                alignSelf: "center",
                fontSize: 12,
                fontStyle: "italic",
                color: colors.inkMuted,
                textAlign: "center",
                maxWidth: 260,
              }}
            >
              Every prayer marked adds a leaf.
            </Text>
          )}
        </Pressable>

        <View
          style={{ alignItems: "center", paddingTop: 22, paddingBottom: 8 }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.inkSubtle,
              fontVariant: ["tabular-nums"],
              letterSpacing: 0.4,
            }}
          >
            {`${unlockedCount} of ${totalCount} unlocked`}
          </Text>
        </View>

        <View style={{ gap: 34, paddingTop: 28 }}>
          {grouped.map((section, sIdx) => (
            <View key={section.category} style={{ gap: 14 }}>
              <View style={{ paddingHorizontal: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "LibreBaskerville-Bold",
                      fontSize: 22,
                      lineHeight: 26,
                      fontStyle: "italic",
                      color: colors.ink,
                    }}
                  >
                    {CATEGORY_LABEL[section.category]}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: colors.inkSubtle,
                      fontVariant: ["tabular-nums"],
                      letterSpacing: 0.3,
                      paddingBottom: 3,
                    }}
                  >
                    {`${section.unlocked} / ${section.total}`}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <BeadRow
                    colors={colors}
                    total={section.total}
                    unlocked={section.unlocked}
                  />
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: colors.divider,
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 20,
                  gap: sIdx === 0 ? 10 : 8,
                }}
              >
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

        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Rosette
            color={colors.inkSubtle}
            trackColor={colors.divider}
            width={100}
          />
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

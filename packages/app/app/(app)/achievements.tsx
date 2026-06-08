import type {
  Achievement,
  AchievementCategory,
} from "@barakah/core/achievements";
import { Ionicons } from "@expo/vector-icons";
import { useQuery as useRqQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Rect } from "react-native-svg";
import { AchievementCard } from "@/components/achievement-card";
import { AchievementDialog } from "@/components/achievement-dialog";
import { AchievementsMesh } from "@/components/meshes";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { api } from "@/lib/api-client";

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

/**
 * Rub-el-hizb seal — two squares rotated 45° around a center, drawn as
 * hairlines. The canonical Islamic eight-point star, used here as the ledger's
 * illuminated mark (hero, section heads, footer). Stroke width is given in
 * device pixels and converted into the 100×100 viewBox so the hairline reads
 * the same at every size.
 */
function KhatamSeal({
  size,
  color,
  ring,
  strokeWidth = 1,
}: {
  color: string;
  ring?: string;
  size: number;
  strokeWidth?: number;
}) {
  const C = 50;
  const R = 33;
  const side = R * Math.SQRT2;
  const o = C - side / 2;
  const sw = strokeWidth * (100 / size);

  return (
    <Svg height={size} viewBox="0 0 100 100" width={size}>
      {ring ? (
        <Circle
          cx={C}
          cy={C}
          fill="none"
          r={46}
          stroke={ring}
          strokeWidth={sw}
        />
      ) : null}
      <G fill="none" stroke={color} strokeLinejoin="round" strokeWidth={sw}>
        <Rect height={side} rx={1.5} width={side} x={o} y={o} />
        <Rect
          height={side}
          rx={1.5}
          transform={`rotate(45 ${C} ${C})`}
          width={side}
          x={o}
          y={o}
        />
        <Circle cx={C} cy={C} r={6.5} />
      </G>
    </Svg>
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
  const { data } = useRqQuery({
    queryKey: ["cf", "achievements"],
    queryFn: async () => {
      const res = await api.api.v1.achievements.$get();
      if (!res.ok) {
        throw new Error("Failed to load achievements");
      }
      return (await res.json()) as unknown as {
        items: Row[];
        totalCount: number;
        unlockedCount: number;
      };
    },
  });
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

  const sealRing = isDark ? "rgba(0,210,106,0.28)" : "rgba(41,96,62,0.26)";
  const ruleColor = isDark ? "rgba(245,235,219,0.12)" : "rgba(94,75,40,0.16)";

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
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.6,
              color: colors.inkSubtle,
            }}
          >
            YOUR LEDGER
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
            paddingTop: 30,
            paddingBottom: 8,
            alignItems: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <KhatamSeal
            color={colors.primary}
            ring={sealRing}
            size={74}
            strokeWidth={1}
          />

          <Text
            style={{
              marginTop: 24,
              alignSelf: "center",
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 33,
              lineHeight: 40,
              letterSpacing: -0.4,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            {mostRecent?.title ?? "Begin where you are"}
          </Text>

          {mostRecent?.unlockedAt ? (
            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{ width: 14, height: 1, backgroundColor: ruleColor }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.6,
                  color: colors.primary,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatStamp(mostRecent.unlockedAt).toUpperCase()}
              </Text>
              <View
                style={{ width: 14, height: 1, backgroundColor: ruleColor }}
              />
            </View>
          ) : (
            <Text
              style={{
                marginTop: 12,
                alignSelf: "center",
                fontSize: 13,
                fontStyle: "italic",
                fontFamily: "LibreBaskerville-Bold",
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
          style={{ alignItems: "center", paddingTop: 18, paddingBottom: 8 }}
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

        <View style={{ gap: 34, paddingTop: 26 }}>
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    <KhatamSeal
                      color={colors.primary}
                      size={14}
                      strokeWidth={0.9}
                    />
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
                  </View>
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

        <View style={{ alignItems: "center", paddingTop: 44, gap: 14 }}>
          <KhatamSeal color={colors.inkSubtle} size={26} strokeWidth={0.9} />
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.8,
              color: colors.inkSubtle,
            }}
          >
            IN SHĀʾ ALLĀH
          </Text>
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

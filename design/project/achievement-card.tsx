import type {
  AchievementIcon,
  AchievementTier,
} from "@barakah/core/achievements";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

interface AchievementRowProps {
  icon: AchievementIcon;
  onPress: () => void;
  progress: { current: number; target: number; unit: string } | null;
  tier: AchievementTier;
  title: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

function formatUnlockedDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function tierAccent(tier: AchievementTier, colors: ThemeColors): string {
  if (tier === "gold") {
    return colors.primary;
  }
  if (tier === "silver") {
    return colors.inkMuted;
  }
  return colors.inkSubtle;
}

export function AchievementCard({
  title,
  icon,
  unlocked,
  tier,
  unlockedAt,
  progress,
  onPress,
}: AchievementRowProps) {
  const { colors, scheme } = useTheme();
  const isDark = scheme === "dark";

  const isGoldUnlocked = unlocked && tier === "gold";

  let surface: string;
  let borderColor: string;
  let titleColor: string;
  let metaColor: string;
  let unitColor: string;
  let discBorder: string;
  let discFill: string;
  let glyphColor: string;
  let stampColor: string | null;
  let stampRing: string;
  let progressTrack: string;
  let progressFill: string;

  if (isGoldUnlocked) {
    surface = colors.primary;
    borderColor = colors.primary;
    titleColor = "#FFFFFF";
    metaColor = "rgba(255,255,255,0.78)";
    unitColor = "rgba(255,255,255,0.62)";
    discBorder = "rgba(255,255,255,0.7)";
    discFill = "transparent";
    glyphColor = "#FFFFFF";
    stampColor = "#FFFFFF";
    stampRing = colors.primary;
    progressTrack = "rgba(255,255,255,0.2)";
    progressFill = "#FFFFFF";
  } else if (unlocked) {
    surface = isDark ? "rgba(245,235,219,0.05)" : "#FAF4E8";
    borderColor = isDark ? "rgba(245,235,219,0.16)" : "rgba(94,75,40,0.18)";
    titleColor = colors.ink;
    metaColor = colors.inkMuted;
    unitColor = colors.inkSubtle;
    discBorder = tierAccent(tier, colors);
    discFill = "transparent";
    glyphColor = tierAccent(tier, colors);
    stampColor = colors.primary;
    stampRing = isDark ? "#1A1A1A" : "#FAF4E8";
    progressTrack = colors.divider;
    progressFill = colors.primary;
  } else {
    surface = isDark ? "rgba(20,20,20,0.55)" : "#FFFFFF";
    borderColor = colors.border;
    titleColor = colors.inkMuted;
    metaColor = colors.inkSubtle;
    unitColor = colors.inkSubtle;
    discBorder = colors.border;
    discFill = "transparent";
    glyphColor = colors.inkSubtle;
    stampColor = null;
    stampRing = "transparent";
    progressTrack = colors.divider;
    progressFill = colors.primary;
  }

  const pressedSurface = isGoldUnlocked
    ? colors.primaryDark
    : isDark
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.03)";

  const showProgress = !unlocked && progress !== null;
  const progressPct = progress
    ? Math.max(0, Math.min(1, progress.current / progress.target))
    : 0;

  const rightMeta = (() => {
    if (unlocked && unlockedAt) {
      return formatUnlockedDate(unlockedAt);
    }
    if (showProgress && progress) {
      return `${progress.current} / ${progress.target}`;
    }
    return "Locked";
  })();

  return (
    <Pressable
      accessibilityLabel={`${title}${unlocked ? ", unlocked" : ", locked"}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 18,
        borderWidth: 1,
        borderColor,
        backgroundColor: pressed ? pressedSurface : surface,
        paddingHorizontal: 16,
        paddingVertical: 14,
        overflow: "hidden",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              borderWidth: 1,
              borderColor: discBorder,
              backgroundColor: discFill,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons color={glyphColor} name={icon} size={18} />
          </View>
          {stampColor ? (
            <View
              style={{
                position: "absolute",
                top: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: stampColor,
                borderWidth: 1.5,
                borderColor: stampRing,
              }}
            />
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 15,
              lineHeight: 20,
              color: titleColor,
            }}
          >
            {title}
          </Text>
          {showProgress && progress ? (
            <Text
              numberOfLines={1}
              style={{
                marginTop: 2,
                fontSize: 11,
                fontWeight: "500",
                color: unitColor,
                fontVariant: ["tabular-nums"],
              }}
            >
              {progress.unit}
            </Text>
          ) : null}
        </View>

        <Text
          style={{
            fontSize: 11,
            fontStyle: unlocked && !isGoldUnlocked ? "italic" : "normal",
            fontWeight: "600",
            color: metaColor,
            fontVariant: ["tabular-nums"],
            letterSpacing: 0.3,
          }}
        >
          {rightMeta}
        </Text>
      </View>

      {showProgress ? (
        <View
          style={{
            marginTop: 12,
            height: 1,
            backgroundColor: progressTrack,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 1,
              width: `${progressPct * 100}%`,
              backgroundColor: progressFill,
            }}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

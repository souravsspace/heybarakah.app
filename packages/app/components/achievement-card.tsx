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
  const surface = isDark ? "rgba(20,20,20,0.6)" : "rgba(255,255,255,0.7)";
  const pressedSurface = isDark
    ? "rgba(26,26,26,0.85)"
    : "rgba(244,244,242,0.85)";
  const borderColor = colors.border;
  const accent = tierAccent(tier, colors);
  const discFill = unlocked && tier === "gold" ? colors.primary : "transparent";
  const discBorder = unlocked ? accent : colors.border;
  const glyphColor = (() => {
    if (!unlocked) {
      return colors.inkSubtle;
    }
    if (tier === "gold") {
      return "#FFFFFF";
    }
    return colors.primary;
  })();
  const titleColor = unlocked ? colors.ink : colors.inkMuted;

  const metaText = (() => {
    if (unlocked && unlockedAt) {
      return `Unlocked ${formatUnlockedDate(unlockedAt)}`;
    }
    if (!unlocked && progress) {
      return `${progress.current} of ${progress.target} ${progress.unit}`;
    }
    return "Locked";
  })();

  return (
    <Pressable
      accessibilityLabel={`${title}${unlocked ? ", unlocked" : ", locked"}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        borderWidth: 1,
        borderColor,
        backgroundColor: pressed ? pressedSurface : surface,
        paddingVertical: 14,
        paddingRight: 14,
        paddingLeft: 0,
        overflow: "hidden",
      })}
    >
      <View
        style={{
          width: 2,
          alignSelf: "stretch",
          backgroundColor: unlocked ? accent : colors.divider,
          marginRight: 14,
        }}
      />
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: discBorder,
          backgroundColor: discFill,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Ionicons color={glyphColor} name={icon} size={20} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 15,
            lineHeight: 19,
            color: titleColor,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: colors.inkSubtle,
            fontVariant: ["tabular-nums"],
          }}
        >
          {metaText}
        </Text>
      </View>
      <Ionicons color={colors.chevron} name="chevron-forward" size={16} />
    </Pressable>
  );
}

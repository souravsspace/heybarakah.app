import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

interface AchievementCardProps {
  icon: string;
  onPress: () => void;
  tier: "bronze" | "silver" | "gold";
  title: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

function tierAccent(
  tier: AchievementCardProps["tier"],
  colors: ThemeColors
): string {
  if (tier === "gold") {
    return colors.primary;
  }
  if (tier === "silver") {
    return colors.primary;
  }
  return colors.primary;
}

function formatUnlockedDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function AchievementCard({
  title,
  icon,
  unlocked,
  tier,
  unlockedAt,
  onPress,
}: AchievementCardProps) {
  const { colors, scheme } = useTheme();
  const surface =
    scheme === "dark" ? "rgba(26,26,26,0.22)" : "rgba(255,255,255,0.12)";
  const pressedSurface =
    scheme === "dark" ? "rgba(26,26,26,0.36)" : "rgba(244,244,242,0.22)";
  const borderColor = scheme === "dark" ? colors.border : "rgba(41,96,62,0.16)";
  const iconColor = unlocked ? tierAccent(tier, colors) : colors.inkSubtle;
  const titleColor = unlocked ? colors.ink : colors.inkMuted;
  const subColor = colors.inkSubtle;

  return (
    <Pressable
      accessibilityLabel={`${title}${unlocked ? ", unlocked" : ", locked"}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        borderColor,
        backgroundColor: pressed ? pressedSurface : surface,
        padding: 16,
        gap: 12,
        opacity: unlocked ? 1 : 0.78,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: unlocked ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          color={iconColor}
          // biome-ignore lint/suspicious/noExplicitAny: dynamic Ionicons name
          name={icon as any}
          size={22}
        />
      </View>
      <View style={{ gap: 4 }}>
        <Text
          numberOfLines={2}
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
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: subColor,
            fontVariant: ["tabular-nums"],
          }}
        >
          {unlocked && unlockedAt ? formatUnlockedDate(unlockedAt) : "Locked"}
        </Text>
      </View>
    </Pressable>
  );
}

import { Text, View } from "react-native";
import type { ThemeColors } from "@/contexts/theme-context";

export function LimitBanner({
  colors,
  remaining,
  limit,
}: {
  colors: ThemeColors;
  remaining: number | null;
  limit: number | null;
}) {
  if (remaining === null || limit === null) {
    return null;
  }
  const reached = remaining <= 0;
  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingVertical: 8,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color: reached ? colors.primary : colors.inkSubtle,
          fontVariant: ["tabular-nums"],
        }}
      >
        {reached
          ? "Daily limit reached. Resets at midnight."
          : `${remaining} of ${limit} questions left today`}
      </Text>
    </View>
  );
}

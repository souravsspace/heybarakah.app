import { Text, View } from "react-native";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

export function MessageBubble({
  colors,
  role,
  content,
}: {
  colors: ThemeColors;
  role: "user" | "assistant";
  content: string;
}) {
  const { scheme } = useTheme();
  if (role === "user") {
    return (
      <View
        style={{
          alignSelf: "flex-end",
          maxWidth: "82%",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 18,
          borderWidth: 1,
          borderColor:
            scheme === "dark" ? colors.border : "rgba(41,96,62,0.22)",
          backgroundColor:
            scheme === "dark"
              ? "rgba(26,26,26,0.32)"
              : "rgba(255,255,255,0.38)",
          marginVertical: 6,
        }}
      >
        <Text
          style={{
            color: colors.ink,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {content}
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        alignSelf: "flex-start",
        maxWidth: "94%",
        paddingHorizontal: 4,
        paddingVertical: 6,
        marginVertical: 6,
      }}
    >
      <Text
        style={{
          color: colors.ink,
          fontSize: 15,
          lineHeight: 24,
        }}
      >
        {content}
      </Text>
    </View>
  );
}

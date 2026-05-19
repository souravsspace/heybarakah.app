import { Text, View } from "react-native";
import type { ThemeColors } from "@/contexts/theme-context";

export function MessageBubble({
  colors,
  role,
  content,
}: {
  colors: ThemeColors;
  role: "user" | "assistant";
  content: string;
}) {
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
          borderColor: colors.border,
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
        maxWidth: "92%",
        paddingHorizontal: 4,
        paddingVertical: 6,
        marginVertical: 6,
      }}
    >
      <Text
        style={{
          color: colors.ink,
          fontSize: 15,
          lineHeight: 23,
        }}
      >
        {content}
      </Text>
    </View>
  );
}

import { Text, View } from "react-native";
import type { ThemeColors } from "@/contexts/theme-context";

export function ChatEmptyState({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        gap: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 24,
          lineHeight: 30,
          color: colors.ink,
          textAlign: "center",
        }}
      >
        Hidāyah
      </Text>
      <Text
        style={{
          fontSize: 14,
          lineHeight: 20,
          color: colors.inkMuted,
          textAlign: "center",
        }}
      >
        Ask only what the Qur'an or authentic Hadith can answer.
      </Text>
    </View>
  );
}

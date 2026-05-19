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
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: colors.primary,
          textAlign: "center",
        }}
      >
        Hidāyah · Guidance
      </Text>
      <Text
        style={{
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 26,
          lineHeight: 32,
          color: colors.ink,
          textAlign: "center",
        }}
      >
        Ask the Qur'an{"\n"}and authentic Hadith.
      </Text>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: colors.inkMuted,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        Replies cite Surah:Ayah or Collection, number. Outside that scope, no
        answer is given.
      </Text>
    </View>
  );
}

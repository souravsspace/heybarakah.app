import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

export function ChatComposer({
  colors,
  disabled,
  placeholder,
  onSend,
}: {
  colors: ThemeColors;
  disabled?: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
}) {
  const { scheme } = useTheme();
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;
  const inputBg =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)";
  const inputBorder =
    scheme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(41,96,62,0.22)";

  const handleSend = () => {
    if (!canSend) {
      return;
    }
    onSend(trimmed);
    setValue("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          minHeight: 52,
          borderWidth: 1,
          borderColor: inputBorder,
          backgroundColor: inputBg,
          borderRadius: 26,
          paddingHorizontal: 18,
          paddingVertical: Platform.OS === "ios" ? 15 : 8,
          justifyContent: "center",
        }}
      >
        <TextInput
          editable={!disabled}
          multiline
          onChangeText={setValue}
          placeholder={placeholder ?? "Ask the Qur'an and Hadith…"}
          placeholderTextColor={colors.inkSubtle}
          style={{
            color: colors.ink,
            fontSize: 15,
            lineHeight: 21,
            maxHeight: 140,
            padding: 0,
            margin: 0,
            textAlignVertical: "center",
          }}
          value={value}
        />
      </View>
      <Pressable
        accessibilityLabel="Send message"
        accessibilityRole="button"
        disabled={!canSend}
        onPress={handleSend}
        style={({ pressed }) => ({
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: canSend ? colors.primary : colors.border,
          backgroundColor: canSend
            ? pressed
              ? colors.primarySoft
              : colors.primary
            : "transparent",
        })}
      >
        <Ionicons
          color={canSend ? "#FFFFFF" : colors.inkSubtle}
          name="arrow-up"
          size={22}
        />
      </Pressable>
    </View>
  );
}

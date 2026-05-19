import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
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
    scheme === "dark" ? "rgba(26,26,26,0.32)" : "rgba(255,255,255,0.42)";

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
        alignItems: "flex-end",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor:
            scheme === "dark" ? colors.border : "rgba(41,96,62,0.18)",
          backgroundColor: inputBg,
          borderRadius: 22,
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 44,
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
            paddingTop: 2,
            paddingBottom: 2,
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
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: canSend ? colors.primary : colors.border,
          backgroundColor:
            pressed && canSend ? colors.primarySoft : "transparent",
        })}
      >
        <Ionicons
          color={canSend ? colors.primary : colors.inkSubtle}
          name="arrow-up"
          size={20}
        />
      </Pressable>
    </View>
  );
}

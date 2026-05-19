import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import { GlassSurface } from "@/components/glass-surface";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

const SURFACE_HEIGHT = 52;
const SURFACE_RADIUS = 26;

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
  const dark = scheme === "dark";
  const surfaceBorder = dark ? "rgba(255,255,255,0.18)" : "rgba(41,96,62,0.22)";
  const blurTint = dark ? "systemUltraThinMaterialDark" : "systemThinMaterial";

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
        paddingVertical: 8,
      }}
    >
      <GlassSurface
        blurTint={blurTint}
        borderColor={surfaceBorder}
        colorScheme={dark ? "dark" : "light"}
        height={SURFACE_HEIGHT}
        radius={SURFACE_RADIUS}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
        >
          <TextInput
            editable={!disabled}
            multiline={false}
            onChangeText={setValue}
            onSubmitEditing={handleSend}
            placeholder={placeholder ?? "Ask the Qur'an and Hadith…"}
            placeholderTextColor={colors.inkSubtle}
            returnKeyType="send"
            style={{
              color: colors.ink,
              fontSize: 15,
              lineHeight: 20,
              padding: 0,
              margin: 0,
              ...(Platform.OS === "android" ? { height: 22 } : null),
            }}
            value={value}
          />
        </View>
      </GlassSurface>

      <GlassSurface
        blurTint={blurTint}
        borderColor={canSend ? colors.primary : surfaceBorder}
        colorScheme={dark ? "dark" : "light"}
        height={SURFACE_HEIGHT}
        radius={SURFACE_RADIUS}
        style={{ width: SURFACE_HEIGHT, flexShrink: 0, flexGrow: 0 }}
      >
        <Pressable
          accessibilityLabel="Send message"
          accessibilityRole="button"
          disabled={!canSend}
          onPress={handleSend}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              pressed && canSend ? colors.primarySoft : "transparent",
          })}
        >
          <Ionicons
            color={canSend ? colors.primary : colors.inkSubtle}
            name="send"
            size={18}
            style={{ marginLeft: -2 }}
          />
        </Pressable>
      </GlassSurface>
    </View>
  );
}

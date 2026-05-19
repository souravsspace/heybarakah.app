import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
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
  const glassTint = dark ? "systemUltraThinMaterialDark" : "systemThinMaterial";
  const glassIntensity = Platform.OS === "ios" ? 60 : 40;
  const surfaceBorder = dark ? "rgba(255,255,255,0.18)" : "rgba(41,96,62,0.22)";
  const fallbackTint = dark
    ? "rgba(255,255,255,0.06)"
    : "rgba(255,255,255,0.55)";

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
      <View
        style={{
          flex: 1,
          height: SURFACE_HEIGHT,
          borderRadius: SURFACE_RADIUS,
          borderWidth: 1,
          borderColor: surfaceBorder,
          overflow: "hidden",
          backgroundColor: fallbackTint,
        }}
      >
        <BlurView
          experimentalBlurMethod="dimezisBlurView"
          intensity={glassIntensity}
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
          tint={glassTint}
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
        </BlurView>
      </View>

      <Pressable
        accessibilityLabel="Send message"
        accessibilityRole="button"
        disabled={!canSend}
        onPress={handleSend}
        style={{
          width: SURFACE_HEIGHT,
          height: SURFACE_HEIGHT,
          borderRadius: SURFACE_RADIUS,
          borderWidth: 1,
          borderColor: canSend ? colors.primary : surfaceBorder,
          overflow: "hidden",
          backgroundColor: fallbackTint,
        }}
      >
        {({ pressed }) => (
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={glassIntensity}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                pressed && canSend ? colors.primarySoft : "transparent",
            }}
            tint={glassTint}
          >
            <AntDesign
              color={canSend ? colors.primary : colors.inkSubtle}
              name="send"
              size={20}
            />
          </BlurView>
        )}
      </Pressable>
    </View>
  );
}

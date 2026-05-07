import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  selected: boolean;
}

export function OptionRow({ label, hint, selected, onPress, icon }: Props) {
  const v = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    v.value = withTiming(selected ? 1 : 0, {
      duration: 160,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected, v]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], ["#FFFFFF", "#E8F0EA"]),
    borderColor: interpolateColor(v.value, [0, 1], ["#E5E7EB", "#29603E"]),
  }));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <Animated.View
        className="flex-row items-center rounded-lg border px-md"
        style={[containerStyle, { minHeight: 60, borderWidth: 1.5 }]}
      >
        {icon ? (
          <Ionicons
            color={selected ? "#29603E" : "#6B7280"}
            name={icon}
            size={20}
            style={{ marginRight: 14 }}
          />
        ) : null}
        <View className="flex-1 py-sm">
          <Text
            className={`font-sans text-label ${
              selected ? "text-primary" : "text-ink"
            }`}
            style={{ fontWeight: selected ? "600" : "500" }}
          >
            {label}
          </Text>
          {hint ? (
            <Text className="mt-[2px] font-sans text-body-sm text-tertiary">
              {hint}
            </Text>
          ) : null}
        </View>
        {selected ? (
          <Ionicons color="#29603E" name="checkmark-circle" size={22} />
        ) : (
          <View className="h-[22px] w-[22px] rounded-full border border-neutral" />
        )}
      </Animated.View>
    </Pressable>
  );
}

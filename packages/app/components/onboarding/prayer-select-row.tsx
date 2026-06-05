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

export function PrayerSelectRow({
  label,
  hint,
  icon,
  selected,
  onPress,
}: Props) {
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
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <Animated.View
        className="flex-row items-center rounded-lg border px-md"
        style={[containerStyle, { minHeight: 68, borderWidth: 1.5 }]}
      >
        {icon ? (
          <View
            className="mr-sm h-[36px] w-[36px] items-center justify-center rounded-md border"
            style={{
              backgroundColor: selected ? "#FFFFFF" : "#FAF4E8",
              borderColor: selected ? "#29603E" : "#E5E7EB",
            }}
          >
            <Ionicons
              color={selected ? "#29603E" : "#6B7280"}
              name={icon}
              size={19}
            />
          </View>
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
          <Ionicons color="#29603E" name="checkbox" size={24} />
        ) : (
          <View className="h-[22px] w-[22px] rounded-md border border-neutral bg-surface" />
        )}
      </Animated.View>
    </Pressable>
  );
}

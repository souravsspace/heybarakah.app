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
  arabic?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  selected: boolean;
}

export function PrayerSelectRow({
  label,
  arabic,
  hint,
  icon,
  selected,
  onPress,
}: Props) {
  const v = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    v.value = withTiming(selected ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected, v]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], ["#FFFFFF", "#E8F0EA"]),
    borderColor: interpolateColor(v.value, [0, 1], ["#E5E7EB", "#29603E"]),
  }));

  const discStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], ["#F5F5F4", "#29603E"]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <Animated.View
        className="flex-row items-center rounded-lg border px-md"
        style={[containerStyle, { minHeight: 70, borderWidth: 1.5 }]}
      >
        {icon ? (
          <Animated.View
            className="mr-md h-[40px] w-[40px] items-center justify-center rounded-full"
            style={discStyle}
          >
            <Ionicons
              color={selected ? "#FAF4E8" : "#9CA3AF"}
              name={icon}
              size={20}
            />
          </Animated.View>
        ) : null}

        <View className="flex-1 py-sm">
          <View className="flex-row items-baseline" style={{ gap: 8 }}>
            <Text
              className={`font-sans text-label ${
                selected ? "text-primary" : "text-ink"
              }`}
              style={{ fontWeight: selected ? "600" : "500" }}
            >
              {label}
            </Text>
            {arabic ? (
              <Text
                className={`font-sans ${
                  selected ? "text-primary" : "text-tertiary"
                }`}
                style={{ fontSize: 15, opacity: selected ? 0.7 : 0.6 }}
              >
                {arabic}
              </Text>
            ) : null}
          </View>
          {hint ? (
            <Text className="mt-[2px] font-sans text-body-sm text-tertiary">
              {hint}
            </Text>
          ) : null}
        </View>

        <Ionicons
          color={selected ? "#29603E" : "#C8CCD2"}
          name={selected ? "lock-closed" : "lock-open-outline"}
          size={18}
        />
      </Animated.View>
    </Pressable>
  );
}

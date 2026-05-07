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
  badge?: string | null;
  cadence: string;
  name: string;
  onPress: () => void;
  perMonth?: string | null;
  price: string;
  recommended?: boolean;
  selected: boolean;
}

export function PlanCard({
  name,
  price,
  cadence,
  perMonth,
  badge,
  recommended,
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

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], ["#FFFFFF", "#E8F0EA"]),
    borderColor: interpolateColor(v.value, [0, 1], ["#E5E7EB", "#29603E"]),
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
    >
      <Animated.View
        className="relative rounded-lg px-md py-md"
        style={[cardStyle, { borderWidth: 1.5 }]}
      >
        {recommended ? (
          <View className="absolute -top-[12px] left-md rounded-full bg-primary px-sm py-[3px]">
            <Text className="font-sans text-label-sm text-surface tracking-wide">
              7 DAY FREE TRIAL
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-sm">
            <Text
              className="font-sans text-ink text-label"
              style={{ fontWeight: "600" }}
            >
              {name}
            </Text>
            {badge ? (
              <Text
                className="mt-[4px] font-sans text-body-sm text-primary"
                style={{ fontWeight: "600" }}
              >
                {badge}
              </Text>
            ) : null}
            {perMonth ? (
              <Text className="mt-[2px] font-sans text-body-sm text-tertiary">
                {perMonth}
              </Text>
            ) : null}
          </View>
          <View className="items-end">
            <Text className="font-serif text-h2 text-ink">{price}</Text>
            <Text className="font-sans text-body-sm text-tertiary">
              / {cadence}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function Dot({ delay }: { delay: number }) {
  const s = useSharedValue(1);

  useEffect(() => {
    s.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.25, { duration: 360, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
      ),
    );
  }, [delay, s]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Animated.View
      className="mx-[6px] h-[10px] w-[10px] rounded-full bg-primary"
      style={style}
    />
  );
}

export function DotsLoader() {
  return (
    <View className="flex-row items-center justify-center">
      <Dot delay={0} />
      <Dot delay={120} />
      <Dot delay={240} />
    </View>
  );
}

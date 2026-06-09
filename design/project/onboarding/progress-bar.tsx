import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function ProgressBar({ progress }: { progress: number }) {
  const w = useSharedValue(progress);

  useEffect(() => {
    w.value = withTiming(progress, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, w]);

  const style = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, w.value)) * 100}%`,
  }));

  return (
    <View className="h-[6px] w-full overflow-hidden rounded-full bg-neutral">
      <Animated.View className="h-full bg-primary" style={style} />
    </View>
  );
}

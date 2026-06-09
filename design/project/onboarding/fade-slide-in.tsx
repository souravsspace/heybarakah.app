import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function FadeSlideIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const o = useSharedValue(0);
  const y = useSharedValue(8);

  useEffect(() => {
    const t = setTimeout(() => {
      o.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      y.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(t);
  }, [delay, o, y]);

  const style = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View className={className} style={style}>
      {children}
    </Animated.View>
  );
}

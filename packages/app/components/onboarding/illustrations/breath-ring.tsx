import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function BreathRing({
  size = 320,
  color = "#29603E",
}: {
  size?: number;
  color?: string;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withRepeat(
      withTiming(1, { duration: 5500, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, [p]);

  const baseR = size / 2 - 16;
  const animatedProps = useAnimatedProps(() => ({
    r: baseR + p.value * 8,
    opacity: 0.08 + p.value * 0.07,
  }));

  return (
    <Svg height={size} width={size}>
      <AnimatedCircle
        animatedProps={animatedProps}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
    </Svg>
  );
}

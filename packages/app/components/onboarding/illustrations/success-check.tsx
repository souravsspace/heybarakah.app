import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function SuccessCheck({ size = 96 }: { size?: number }) {
  const p = useSharedValue(0);
  const length = 60;

  useEffect(() => {
    p.value = withDelay(
      150,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - p.value),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx={48} cy={48} r={44} stroke="#29603E" strokeWidth={2} fill="#FFFFFF" />
      <AnimatedPath
        d="M 30 50 L 44 64 L 68 36"
        stroke="#29603E"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

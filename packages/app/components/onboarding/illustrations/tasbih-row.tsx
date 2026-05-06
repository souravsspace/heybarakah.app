import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Bead({
  cx,
  cy,
  r,
  fill,
  stroke,
  delay,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;
  delay: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    r: r * p.value,
    opacity: p.value,
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
      animatedProps={animatedProps}
    />
  );
}

export function TasbihRow({
  width = 240,
  count = 11,
}: {
  width?: number;
  count?: number;
}) {
  const r = 7;
  const gap = (width - r * 2 * count) / (count - 1);
  const y = 16;
  const center = Math.floor(count / 2);

  return (
    <Svg width={width} height={32}>
      <Line
        x1={r}
        y1={y}
        x2={width - r}
        y2={y}
        stroke="#29603E"
        strokeOpacity={0.25}
        strokeWidth={1}
      />
      {Array.from({ length: count }).map((_, i) => {
        const cx = r + i * (r * 2 + gap);
        const big = i === center;
        const sideKnot = !big && (i === center - 1 || i === center + 1);
        return (
          <Bead
            key={i}
            cx={cx}
            cy={y}
            r={big ? r + 2 : sideKnot ? r - 1 : r}
            fill={big ? "#29603E" : "#FFFFFF"}
            stroke="#29603E"
            delay={Math.abs(i - center) * 60}
          />
        );
      })}
    </Svg>
  );
}

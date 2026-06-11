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
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    r: r * p.value,
    opacity: p.value,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={cx}
      cy={cy}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
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
  const gap = count > 1 ? (width - r * 2 * count) / (count - 1) : 0;
  const y = 16;
  const center = Math.floor(count / 2);

  return (
    <Svg height={32} width={width}>
      <Line
        stroke="#29603E"
        strokeOpacity={0.25}
        strokeWidth={1}
        x1={r}
        x2={width - r}
        y1={y}
        y2={y}
      />
      {Array.from({ length: count }).map((_, i) => {
        const cx = r + i * (r * 2 + gap);
        const big = i === center;
        const sideKnot = !big && (i === center - 1 || i === center + 1);
        return (
          <Bead
            cx={cx}
            cy={y}
            delay={Math.abs(i - center) * 60}
            fill={big ? "#29603E" : "#FFFFFF"}
            key={i}
            r={big ? r + 2 : sideKnot ? r - 1 : r}
            stroke="#29603E"
          />
        );
      })}
    </Svg>
  );
}

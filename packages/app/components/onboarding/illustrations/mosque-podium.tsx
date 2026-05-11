import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PATHS = [
  "M3 22V19.5C3 17.4317 3.34533 17 5 17H17C18.6547 17 19 17.4317 19 19.5V22H3Z",
  "M2 22H22",
  "M17.5125 6C15.9698 4 18.3389 3 19 2C19.6611 3 22.0302 4 20.4875 6H17.5125Z",
  "M17.5 6L17 17M17 22H21L20.5 6",
  "M11.0006 8C12.984 10.25 16.9992 11 16.9992 17H5C5 11 9.01516 10.25 10.9986 8",
];

function StaggeredPath({
  d,
  color,
  scaleVal,
  delay,
}: {
  d: string;
  color: string;
  scaleVal: number;
  delay: number;
}) {
  const o = useSharedValue(0);

  useEffect(() => {
    o.value = withDelay(
      delay,
      withTiming(1, { duration: 720, easing: Easing.out(Easing.quad) })
    );
  }, [o, delay]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: o.value,
  }));

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={d} fill={color} fillOpacity={0.06} stroke="none" />
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5 / scaleVal}
        vectorEffect="non-scaling-stroke"
      />
    </AnimatedG>
  );
}

function Twinkle({
  cx,
  cy,
  color,
  delay,
}: {
  cx: number;
  cy: number;
  color: string;
  delay: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true
      )
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: 0.18 + p.value * 0.42,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={cx}
      cy={cy}
      fill={color}
      r={1.2}
    />
  );
}

const STARS = [
  { x: 0.22, y: 0.18, delay: 0 },
  { x: 0.78, y: 0.22, delay: 700 },
  { x: 0.34, y: 0.08, delay: 1400 },
  { x: 0.66, y: 0.06, delay: 2100 },
];

export function MosquePodium({
  size = 180,
  color = "#29603E",
}: {
  size?: number;
  color?: string;
}) {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: 7200,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true
    );
  }, [breath]);

  const haloProps = useAnimatedProps(() => ({
    opacity: 0.55 + breath.value * 0.4,
  }));

  const groupBreath = useAnimatedProps(() => ({
    opacity: 0.88 + breath.value * 0.12,
  }));

  const mosqueSize = size * 0.62;
  const scale = mosqueSize / 24;
  const tx = (size - mosqueSize) / 2;
  const ty = (size - mosqueSize) / 2 + 4;

  return (
    <Svg height={size} width={size}>
      <Defs>
        <RadialGradient cx="50%" cy="50%" id="podiumHalo" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="0.24" />
          <Stop offset="0.5" stopColor={color} stopOpacity="0.08" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <AnimatedCircle
        animatedProps={haloProps}
        cx={size / 2}
        cy={size / 2}
        fill="url(#podiumHalo)"
        r={size / 2}
      />

      {STARS.map((s) => (
        <Twinkle
          color={color}
          cx={size * s.x}
          cy={size * s.y}
          delay={s.delay}
          key={`${s.x}-${s.y}`}
        />
      ))}

      <AnimatedG
        animatedProps={groupBreath}
        transform={`translate(${tx} ${ty}) scale(${scale})`}
      >
        {PATHS.map((d, i) => (
          <StaggeredPath
            color={color}
            d={d}
            delay={180 + i * 220}
            key={d}
            scaleVal={scale}
          />
        ))}
      </AnimatedG>
    </Svg>
  );
}

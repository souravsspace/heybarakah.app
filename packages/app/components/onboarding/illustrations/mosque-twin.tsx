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
  "M3 22L21 22",
  "M3 12L21 12",
  "M5 8H19",
  "M4 12V22M20 12V22",
  "M6 8V12M18 8V12",
  "M9.02481 8C5.93952 5.5 10.6777 4.25 11.9998 3C13.3221 4.25 18.0602 5.5 14.9748 8H9.02481Z",
  "M12 3V2",
  "M15 22V21.1056C15 19.6764 15 18.9618 14.776 18.321C14.6392 17.9296 14.4424 17.5619 14.1927 17.231C13.7837 16.6891 13.1891 16.2927 12 15.5C10.8109 16.2927 10.2163 16.6891 9.80733 17.231C9.55758 17.5619 9.36078 17.9296 9.224 18.321C9 18.9618 9 19.6764 9 21.1056V22",
];

function StaggeredPath({
  d,
  color,
  delay,
}: {
  d: string;
  color: string;
  delay: number;
}) {
  const o = useSharedValue(0);

  useEffect(() => {
    o.value = withDelay(
      delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }),
    );
  }, [o, delay]);

  const animatedProps = useAnimatedProps(() => ({ opacity: o.value }));

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={d} fill={color} fillOpacity={0.05} stroke="none" />
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
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
          duration: 3200,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true,
      ),
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: 0.16 + p.value * 0.44,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={cx}
      cy={cy}
      fill={color}
      r={1.4}
    />
  );
}

const STARS = [
  { x: 0.18, y: 0.16, delay: 0 },
  { x: 0.82, y: 0.18, delay: 600 },
  { x: 0.28, y: 0.06, delay: 1200 },
  { x: 0.72, y: 0.08, delay: 1800 },
  { x: 0.5, y: 0.03, delay: 2400 },
];

export function MosqueTwin({
  size = 360,
  color = "#29603E",
}: {
  size?: number;
  color?: string;
}) {
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: 7600,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );
    sway.value = withRepeat(
      withTiming(1, {
        duration: 11_000,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );
  }, [breath, sway]);

  const haloProps = useAnimatedProps(() => ({
    opacity: 0.55 + breath.value * 0.4,
  }));

  const groupBreath = useAnimatedProps(() => ({
    opacity: 0.9 + breath.value * 0.1,
  }));

  const innerRingProps = useAnimatedProps(() => ({
    opacity: 0.06 + breath.value * 0.06,
    r: size * 0.34 + sway.value * 4,
  }));

  const mosqueSize = size * 0.7;
  const scale = mosqueSize / 24;
  const tx = (size - mosqueSize) / 2;
  const ty = (size - mosqueSize) / 2 + 6;

  return (
    <Svg height={size} width={size}>
      <Defs>
        <RadialGradient cx="50%" cy="50%" id="twinHalo" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="0.22" />
          <Stop offset="0.5" stopColor={color} stopOpacity="0.08" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <AnimatedCircle
        animatedProps={haloProps}
        cx={size / 2}
        cy={size / 2}
        fill="url(#twinHalo)"
        r={size / 2}
      />

      <AnimatedCircle
        animatedProps={innerRingProps}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke={color}
        strokeWidth={1}
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
          <StaggeredPath color={color} d={d} delay={160 + i * 180} key={d} />
        ))}
      </AnimatedG>
    </Svg>
  );
}

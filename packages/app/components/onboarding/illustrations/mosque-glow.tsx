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
  Line,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

const MOSQUE_PATHS = [
  "M5.46474 13C2.34824 9.5 7.66448 7.75 9 6C10.3357 7.75 15.652 9.5 12.5354 13H5.46474Z",
  "M17.7631 7C15.704 4.5 18.3676 3.25 19.25 2C20.1325 3.25 22.796 4.5 20.7369 7H17.7631Z",
  "M10 3.65685C9.78799 3.86887 9.49509 4 9.17157 4C8.52453 4 8 3.47547 8 2.82843C8 2.50491 8.13113 2.21201 8.34315 2",
  "M9 4V5V6",
  "M17 17V22H4.14286C3.1327 22 2.62763 22 2.31381 21.7071C2 21.4142 2 20.9428 2 20V17C2 15.1144 2 14.1716 2.62763 13.5858C3.25526 13 4.26541 13 6.28571 13H12.7143C14.7346 13 15.7447 13 16.3724 13.5858C17 14.1716 17 15.1144 17 17Z",
  "M15 22H17.6871C19.8378 22 20.9131 22 21.5333 21.342C22.1535 20.684 22.0465 19.6567 21.8325 17.602L20.7283 7H17.6038L16.6317 13.5",
  "M7.00009 22V20C6.98279 17 9.5 16 9.5 16C9.5 16 12.0172 17 11.9999 20V22",
];

const STARS = [
  { x: 0.18, y: 0.12, delay: 0 },
  { x: 0.32, y: 0.06, delay: 900 },
  { x: 0.68, y: 0.09, delay: 1800 },
  { x: 0.82, y: 0.16, delay: 2700 },
  { x: 0.5, y: 0.04, delay: 3600 },
];

const RIPPLE_COUNT = 4;
const RIPPLE_DURATION = 7200;

function Ripple({
  cx,
  cy,
  startR,
  endR,
  color,
  delay,
}: {
  cx: number;
  cy: number;
  startR: number;
  endR: number;
  color: string;
  delay: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: RIPPLE_DURATION,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      )
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    r: startR + p.value * (endR - startR),
    opacity: 0.24 * (1 - p.value) * Math.min(1, p.value * 5),
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={cx}
      cy={cy}
      fill="none"
      stroke={color}
      strokeWidth={1}
    />
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
          duration: 3400,
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
      r={1.4}
    />
  );
}

export function MosqueGlow({
  size = 420,
  color = "#29603E",
}: {
  size?: number;
  color?: string;
}) {
  const mosqueOpacity = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    mosqueOpacity.value = withTiming(1, {
      duration: 1600,
      easing: Easing.out(Easing.quad),
    });
    breath.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true
    );
  }, [mosqueOpacity, breath]);

  const mosqueProps = useAnimatedProps(() => ({
    opacity: mosqueOpacity.value,
  }));

  const haloProps = useAnimatedProps(() => ({
    opacity: 0.7 + breath.value * 0.3,
  }));

  const mosqueSize = Math.round(size * 0.55);
  const scale = mosqueSize / 24;
  const tx = (size - mosqueSize) / 2;
  const ty = (size - mosqueSize) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startR = mosqueSize * 0.6;
  const endR = size / 2 - 4;
  const baseY = ty + mosqueSize - scale * 0.5;
  const horizonOpacity = 0.16;

  return (
    <Svg height={size} width={size}>
      <Defs>
        <RadialGradient cx="50%" cy="50%" id="mosqueHalo" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="0.22" />
          <Stop offset="0.45" stopColor={color} stopOpacity="0.08" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <AnimatedCircle
        animatedProps={haloProps}
        cx={cx}
        cy={cy}
        fill="url(#mosqueHalo)"
        r={size / 2}
      />

      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
        <Ripple
          color={color}
          cx={cx}
          cy={cy}
          delay={(RIPPLE_DURATION / RIPPLE_COUNT) * i}
          endR={endR}
          key={i}
          startR={startR}
        />
      ))}

      {STARS.map((s) => (
        <Twinkle
          color={color}
          cx={size * s.x}
          cy={size * s.y}
          delay={s.delay}
          key={`${s.x}-${s.y}`}
        />
      ))}

      <Line
        opacity={horizonOpacity}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1}
        x1={size * 0.16}
        x2={size * 0.84}
        y1={baseY}
        y2={baseY}
      />

      <AnimatedG
        animatedProps={mosqueProps}
        transform={`translate(${tx} ${ty}) scale(${scale})`}
      >
        {MOSQUE_PATHS.flatMap((d) => [
          <Path
            d={d}
            fill={color}
            fillOpacity={0.07}
            key={`f-${d}`}
            stroke="none"
          />,
          <Path
            d={d}
            fill="none"
            key={`s-${d}`}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4 / scale}
            vectorEffect="non-scaling-stroke"
          />,
        ])}
      </AnimatedG>
    </Svg>
  );
}

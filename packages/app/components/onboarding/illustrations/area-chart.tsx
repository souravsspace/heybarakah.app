import { useEffect, useMemo } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  values?: number[];
  labels?: string[];
  width?: number;
  height?: number;
  peakIndex?: number;
  peakLabel?: string;
};

type Pt = { x: number; y: number };

function smoothPath(points: Pt[]): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

export function AreaChart({
  values = [0.22, 0.48, 0.6, 0.95, 0.68],
  labels = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  width = 300,
  height = 190,
  peakIndex,
  peakLabel = "96 / day",
}: Props) {
  const padX = 18;
  const padTop = 32;
  const padBottom = 28;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const baseY = height - padBottom;

  const points = useMemo<Pt[]>(
    () =>
      values.map((v, i) => ({
        x: padX + (innerW * i) / (values.length - 1),
        y: padTop + innerH * (1 - v),
      })),
    [values, innerW, innerH, padX, padTop]
  );

  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = useMemo(
    () =>
      `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`,
    [linePath, points, baseY]
  );

  const highlight =
    peakIndex ?? values.indexOf(Math.max(...values));
  const peak = points[highlight];

  const reveal = useSharedValue(0);
  const dot = useSharedValue(0);

  useEffect(() => {
    reveal.value = withTiming(1, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    dot.value = withDelay(
      900,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
  }, [reveal, dot]);

  const clipProps = useAnimatedProps(() => ({
    width: padX + innerW * reveal.value,
  }));
  const dotProps = useAnimatedProps(() => ({ r: 5 * dot.value }));
  const haloProps = useAnimatedProps(() => ({
    r: 11 * dot.value,
    opacity: 0.18 * dot.value,
  }));

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#29603E" stopOpacity={0.26} />
          <Stop offset="1" stopColor="#29603E" stopOpacity={0} />
        </LinearGradient>
        <ClipPath id="reveal">
          <AnimatedRect x={0} y={0} height={height} animatedProps={clipProps} />
        </ClipPath>
      </Defs>

      {[0.25, 0.5, 0.75].map((g) => {
        const y = padTop + innerH * (1 - g);
        return (
          <Line
            key={g}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth={0.5}
            strokeDasharray="3,4"
          />
        );
      })}
      <Line
        x1={padX}
        y1={baseY}
        x2={width - padX}
        y2={baseY}
        stroke="#E5E7EB"
        strokeWidth={1}
      />

      <Path d={areaPath} fill="url(#areaFill)" clipPath="url(#reveal)" />
      <Path
        d={linePath}
        stroke="#29603E"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath="url(#reveal)"
      />

      <Line
        x1={peak.x}
        y1={peak.y + 4}
        x2={peak.x}
        y2={baseY}
        stroke="#29603E"
        strokeWidth={1}
        strokeDasharray="2,3"
        opacity={0.4}
      />

      <AnimatedCircle
        cx={peak.x}
        cy={peak.y}
        fill="#29603E"
        animatedProps={haloProps}
      />
      <AnimatedCircle
        cx={peak.x}
        cy={peak.y}
        fill="#29603E"
        stroke="#FFFFFF"
        strokeWidth={2}
        animatedProps={dotProps}
      />

      <SvgText
        x={peak.x}
        y={peak.y - 14}
        fontSize="11"
        fill="#29603E"
        textAnchor="middle"
        fontFamily="Inter"
        fontWeight="700"
      >
        {peakLabel}
      </SvgText>

      {labels.map((l, i) => {
        const x = padX + (innerW * i) / (values.length - 1);
        const isPeak = i === highlight;
        return (
          <SvgText
            key={l + i}
            x={x}
            y={height - 8}
            fontSize="10"
            fill={isPeak ? "#29603E" : "#6B7280"}
            textAnchor="middle"
            fontFamily="Inter"
            fontWeight={isPeak ? "700" : "400"}
          >
            {l}
          </SvgText>
        );
      })}
    </Svg>
  );
}

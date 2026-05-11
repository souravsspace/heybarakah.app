import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
  height?: number;
  highlightLast?: boolean;
  labels?: string[];
  values?: number[];
  width?: number;
}

function Bar({
  x,
  baseY,
  width,
  targetH,
  fill,
  delay,
}: {
  x: number;
  baseY: number;
  width: number;
  targetH: number;
  fill: string;
  delay: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    height: targetH * p.value,
    y: baseY - targetH * p.value,
  }));

  return (
    <AnimatedRect
      animatedProps={animatedProps}
      fill={fill}
      rx={4}
      width={width}
      x={x}
    />
  );
}

export function MiniChart({
  values = [0.3, 0.5, 0.4, 0.7, 0.95],
  width = 260,
  height = 160,
  highlightLast = true,
  labels,
}: Props) {
  const padX = 14;
  const padTop = 14;
  const padBottom = labels ? 26 : 14;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const gap = 10;
  const barW = (innerW - gap * (values.length - 1)) / values.length;
  const baseY = height - padBottom;

  return (
    <Svg height={height} width={width}>
      <Line
        stroke="#E5E7EB"
        strokeWidth={1}
        x1={padX}
        x2={width - padX}
        y1={baseY}
        y2={baseY}
      />
      {[0.25, 0.5, 0.75].map((g) => {
        const y = padTop + innerH * (1 - g);
        return (
          <Line
            key={g}
            stroke="#E5E7EB"
            strokeDasharray="3,4"
            strokeWidth={0.5}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
          />
        );
      })}
      {values.map((v, i) => {
        const x = padX + i * (barW + gap);
        const targetH = innerH * v;
        const isLast = i === values.length - 1;
        const fill = highlightLast && isLast ? "#29603E" : "#C7D6CC";
        return (
          <Bar
            baseY={baseY}
            delay={i * 90}
            fill={fill}
            key={i}
            targetH={targetH}
            width={barW}
            x={x}
          />
        );
      })}
      {labels?.map((l, i) => {
        const x = padX + i * (barW + gap) + barW / 2;
        return (
          <SvgText
            fill="#6B7280"
            fontFamily="Inter"
            fontSize="10"
            key={l + i}
            textAnchor="middle"
            x={x}
            y={height - 6}
          >
            {l}
          </SvgText>
        );
      })}
    </Svg>
  );
}

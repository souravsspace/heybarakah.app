import { useMemo, useState } from "react";
import { type LayoutChangeEvent, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface Point {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: Point[];
  fill?: string;
  height?: number;
  max?: number;
  stroke?: string;
}

const PAD_X = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function AreaChart({
  data,
  height = 180,
  max,
  stroke = "#29603E",
  fill = "#29603E",
}: AreaChartProps) {
  const [width, setWidth] = useState(320);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== width) {
      setWidth(w);
    }
  };
  const ceil = max ?? Math.max(...data.map((d) => d.value), 1);

  const { areaPath, linePath, dots } = useMemo(() => {
    if (data.length === 0) {
      return {
        areaPath: "",
        linePath: "",
        dots: [] as { x: number; y: number }[],
      };
    }
    const innerW = width - PAD_X * 2;
    const innerH = height - PAD_TOP - PAD_BOTTOM;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const pts = data.map((d, i) => ({
      x: PAD_X + step * i,
      y: PAD_TOP + innerH * (1 - d.value / ceil),
    }));

    const curve = (
      a: { x: number; y: number },
      b: { x: number; y: number }
    ) => {
      const cx = (a.x + b.x) / 2;
      return `C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
    };

    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      line += ` ${curve(pts[i - 1], pts[i])}`;
    }
    const area = `${line} L ${pts.at(-1)?.x} ${PAD_TOP + innerH} L ${pts[0].x} ${PAD_TOP + innerH} Z`;

    return { areaPath: area, linePath: line, dots: pts };
  }, [ceil, data, height, width]);

  return (
    <View onLayout={onLayout}>
      <Svg height={height} viewBox={`0 0 ${width} ${height}`} width="100%">
        <Defs>
          <LinearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={fill} stopOpacity={0.22} />
            <Stop offset="1" stopColor={fill} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#areaFill)" />
        <Path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
        />
        {dots.map((p, i) => (
          <Path
            d={`M ${p.x - 3} ${p.y} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
            fill="#FFFFFF"
            key={`${p.x}-${i}`}
            stroke={stroke}
            strokeWidth={1.6}
          />
        ))}
      </Svg>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: PAD_X,
          marginTop: -8,
        }}
      >
        {data.map((d, i) => (
          <Text
            key={`${i}-${d.label}`}
            style={{ fontSize: 10, color: "#6B7280", fontWeight: "600" }}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

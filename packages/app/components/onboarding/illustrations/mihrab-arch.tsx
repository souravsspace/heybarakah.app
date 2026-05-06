import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  children?: React.ReactNode;
  ornate?: boolean;
};

export function MihrabArch({ size = 220, children, ornate = true }: Props) {
  const w = size;
  const h = size * 1.25;
  const r = w / 2;
  const stroke = 1.5;
  const baseY = h - 1;
  const archD = `M ${stroke} ${baseY} L ${stroke} ${r} A ${r - stroke} ${r - stroke} 0 0 1 ${w - stroke} ${r} L ${w - stroke} ${baseY}`;
  const innerInset = 10;
  const ir = r - innerInset;
  const innerD = `M ${innerInset} ${baseY - 2} L ${innerInset} ${r} A ${ir} ${ir} 0 0 1 ${w - innerInset} ${r} L ${w - innerInset} ${baseY - 2}`;
  const apexY = r - innerInset;
  const finialD = `M ${r - 6} ${apexY} L ${r} ${apexY - 10} L ${r + 6} ${apexY}`;

  return (
    <View
      style={{ width: w, height: h, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={w} height={h} style={{ position: "absolute" }}>
        <Path
          d={archD}
          stroke="#29603E"
          strokeWidth={stroke}
          fill="#FFFFFF"
          strokeLinejoin="round"
        />
        {ornate ? (
          <>
            <Path
              d={innerD}
              stroke="#29603E"
              strokeOpacity={0.35}
              strokeWidth={1}
              fill="none"
              strokeLinejoin="round"
            />
            <Path
              d={finialD}
              stroke="#29603E"
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}
      </Svg>
      <View
        style={{
          position: "absolute",
          width: w,
          height: h,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 18,
          paddingHorizontal: innerInset + 6,
        }}
      >
        {children}
      </View>
    </View>
  );
}

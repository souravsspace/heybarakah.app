import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  children?: React.ReactNode;
  ornate?: boolean;
  size?: number;
}

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
      style={{
        width: w,
        height: h,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg height={h} style={{ position: "absolute" }} width={w}>
        <Path
          d={archD}
          fill="#FFFFFF"
          stroke="#29603E"
          strokeLinejoin="round"
          strokeWidth={stroke}
        />
        {ornate ? (
          <>
            <Path
              d={innerD}
              fill="none"
              stroke="#29603E"
              strokeLinejoin="round"
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            <Path
              d={finialD}
              fill="none"
              stroke="#29603E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
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

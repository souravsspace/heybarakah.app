import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export function MosqueMinaret({
  size = 120,
  color = "#FFFFFF",
  opacity = 1,
}: {
  size?: number;
  color?: string;
  opacity?: number;
}) {
  const strokeProps = {
    fill: "none" as const,
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.5,
  };

  return (
    <View style={{ width: size, height: size, opacity }}>
      <Svg height={size} viewBox="0 0 24 24" width={size}>
        <Path
          d="M3 22V19.5C3 17.4317 3.34533 17 5 17H17C18.6547 17 19 17.4317 19 19.5V22H3Z"
          {...strokeProps}
        />
        <Path d="M2 22H22" {...strokeProps} />
        <Path
          d="M17.5125 6C15.9698 4 18.3389 3 19 2C19.6611 3 22.0302 4 20.4875 6H17.5125Z"
          {...strokeProps}
        />
        <Path d="M17.5 6L17 17M17 22H21L20.5 6" {...strokeProps} />
        <Path
          d="M11.0006 8C12.984 10.25 16.9992 11 16.9992 17H5C5 11 9.01516 10.25 10.9986 8"
          {...strokeProps}
        />
      </Svg>
    </View>
  );
}

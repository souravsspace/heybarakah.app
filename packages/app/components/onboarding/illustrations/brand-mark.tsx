import Svg, { Circle, Path } from "react-native-svg";

export function BrandMark({ size = 96, color = "#29603E" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx="48" cy="48" r="46" stroke={color} strokeWidth={1.5} fill="#FFFFFF" />
      <Path
        d="M 48 24 C 38 24 30 32 30 42 C 30 52 38 60 48 60 C 56 60 62 56 64 50 C 60 54 54 56 48 56 C 40 56 34 50 34 42 C 34 34 40 28 48 28 Z"
        fill={color}
      />
      <Circle cx="64" cy="32" r="3" fill={color} />
    </Svg>
  );
}

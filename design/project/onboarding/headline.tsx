import { Text, type TextProps } from "react-native";

type Size = "display" | "h1" | "h2";
type Align = "left" | "center";

export function Headline({
  size = "h1",
  align = "center",
  className = "",
  children,
  ...rest
}: TextProps & { size?: Size; align?: Align; children: React.ReactNode }) {
  const sizeClass =
    size === "display" ? "text-display" : size === "h2" ? "text-h2" : "text-h1";
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <Text
      className={`font-serif text-ink ${alignClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {children}
    </Text>
  );
}

import { Text, type TextProps } from "react-native";

type Tone = "default" | "muted";
type Size = "lg" | "md" | "sm";
type Align = "left" | "center";

export function BodyText({
  tone = "default",
  size = "md",
  align = "center",
  className = "",
  children,
  ...rest
}: TextProps & {
  tone?: Tone;
  size?: Size;
  align?: Align;
  children: React.ReactNode;
}) {
  const sizeClass = size === "sm" ? "text-body-sm" : "text-body";
  const toneClass = tone === "muted" ? "text-tertiary" : "text-ink";
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <Text
      className={`font-sans ${alignClass} ${sizeClass} ${toneClass} ${className}`}
      {...rest}
    >
      {children}
    </Text>
  );
}

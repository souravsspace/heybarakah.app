import * as Haptics from "expo-haptics";
import { Pressable, type PressableProps, Text } from "react-native";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  height?: number;
};

export function Button({
  label,
  variant = "primary",
  height = 64,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const bgClass = disabled
    ? "bg-neutral"
    : isPrimary
      ? "bg-primary"
      : "bg-surface border border-neutral";
  const fgClass = disabled
    ? "text-tertiary"
    : isPrimary
      ? "text-surface"
      : "text-ink";

  return (
    <Pressable
      accessibilityRole="button"
      className={`w-full items-center justify-center rounded-2xl px-md py-md ${bgClass}`}
      disabled={disabled}
      onPress={(event) => {
        if (!disabled) {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress?.(event);
      }}
      style={({ pressed }) => ({
        minHeight: height,
        height,
        opacity: pressed && !disabled ? 0.92 : 1,
      })}
      {...rest}
    >
      <Text
        className={`font-sans text-2xl ${fgClass}`}
        style={{ fontWeight: "700", letterSpacing: 0.2 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

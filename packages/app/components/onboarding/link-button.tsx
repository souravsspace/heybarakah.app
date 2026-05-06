import { Pressable, Text, type PressableProps } from "react-native";

export function LinkButton({
  label,
  onPress,
  ...rest
}: PressableProps & { label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      {...rest}
    >
      <Text className="font-sans text-body-sm text-tertiary text-center underline">
        {label}
      </Text>
    </Pressable>
  );
}

import { Pressable, type PressableProps, Text } from "react-native";

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
      <Text className="text-center font-sans text-body-sm text-tertiary underline">
        {label}
      </Text>
    </Pressable>
  );
}

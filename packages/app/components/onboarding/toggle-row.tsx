import * as Haptics from "expo-haptics";
import { Pressable, Switch, Text, View } from "react-native";

type Props = {
  label: string;
  hint?: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleRow({ label, hint, value, onToggle }: Props) {
  return (
    <Pressable
      className="flex-row items-center rounded-md border border-neutral bg-surface px-md py-sm"
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onToggle();
      }}
    >
      <View className="flex-1 pr-sm">
        <Text className="font-sans text-ink text-label">{label}</Text>
        {hint ? (
          <Text className="mt-[2px] font-sans text-body-sm text-tertiary">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        onValueChange={() => {
          Haptics.selectionAsync().catch(() => {});
          onToggle();
        }}
        thumbColor="#FFFFFF"
        trackColor={{ false: "#E5E7EB", true: "#29603E" }}
        value={value}
      />
    </Pressable>
  );
}

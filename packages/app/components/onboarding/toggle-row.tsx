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
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onToggle();
      }}
      className="flex-row items-center px-md py-sm rounded-md border border-neutral bg-surface"
    >
      <View className="flex-1 pr-sm">
        <Text className="font-sans text-label text-ink">{label}</Text>
        {hint ? (
          <Text className="font-sans text-body-sm text-tertiary mt-[2px]">{hint}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={() => {
          Haptics.selectionAsync().catch(() => {});
          onToggle();
        }}
        trackColor={{ false: "#E5E7EB", true: "#29603E" }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}

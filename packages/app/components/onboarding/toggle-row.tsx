import * as Haptics from "expo-haptics";
import { Pressable, Switch, Text, View } from "react-native";

interface Props {
  hint?: string;
  label: string;
  onToggle: () => void;
  value: boolean;
}

export function ToggleRow({ label, hint, value, onToggle }: Props) {
  return (
    <Pressable
      className="flex-row items-center rounded-md border border-neutral bg-surface px-md py-sm"
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
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
      {/* Visual only — Pressable owns the toggle so a single tap fires once. */}
      <View pointerEvents="none">
        <Switch
          onValueChange={onToggle}
          thumbColor="#FFFFFF"
          trackColor={{ false: "#E5E7EB", true: "#29603E" }}
          value={value}
        />
      </View>
    </Pressable>
  );
}

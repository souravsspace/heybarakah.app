import { ActivityIndicator, View } from "react-native";

export function AuthLoading() {
  return (
    <View
      className="flex-1 items-center justify-center bg-surface"
      style={{ gap: 12 }}
    >
      <ActivityIndicator color="#29603E" size="large" />
    </View>
  );
}

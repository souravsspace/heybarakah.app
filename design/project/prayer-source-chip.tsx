import type { PrayerTimesSource } from "@barakah/core/prayer";
import { Text, View } from "react-native";
import { useTheme } from "@/contexts/theme-context";

type ChipState =
  | { kind: "syncing" }
  | { kind: "offline" }
  | { kind: "stale" }
  | { kind: "live"; source: PrayerTimesSource };

interface Props {
  isOnline: boolean;
  isStale: boolean;
  refreshing: boolean;
  source: PrayerTimesSource;
}

function resolveState({
  isOnline,
  isStale,
  refreshing,
  source,
}: Props): ChipState | null {
  if (refreshing) {
    return { kind: "syncing" };
  }
  if (!isOnline) {
    return { kind: "offline" };
  }
  if (isStale && source === "adhan-js") {
    return { kind: "stale" };
  }
  if (source === "aladhan" || source === "hybrid") {
    return { kind: "live", source };
  }
  return null;
}

function describe(state: ChipState): string {
  switch (state.kind) {
    case "syncing":
      return "Syncing";
    case "offline":
      return "Offline";
    case "stale":
      return "Calculated";
    case "live":
      return state.source === "hybrid" ? "Verified" : "Live";
    default:
      return "";
  }
}

export function PrayerSourceChip(props: Props) {
  const { colors } = useTheme();
  const state = resolveState(props);
  if (!state) {
    return null;
  }
  const isLive = state.kind === "live";
  const color = isLive ? colors.primary : colors.inkSubtle;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: isLive ? colors.primary : colors.border,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          color,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        {describe(state)}
      </Text>
    </View>
  );
}

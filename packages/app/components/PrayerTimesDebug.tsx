import { Pressable, Text, View } from "react-native";

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

interface PrayerTimesDebugProps {
  cacheStatus: "cache-hit" | "cache-miss" | "stale" | "unknown";
  isRefreshing?: boolean;
  locationLabel: string;
  methodLabel: string;
  nextPrayer: {
    name: PrayerName;
    time: string;
  } | null;
  onRefresh: () => void;
  onScheduleNotifications: () => void;
  schoolLabel: string;
  timezone: string;
  todayTimes: Record<PrayerName, string>;
}

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function titleCasePrayer(prayer: PrayerName): string {
  return prayer.charAt(0).toUpperCase() + prayer.slice(1);
}

function cacheStatusLabel(
  status: PrayerTimesDebugProps["cacheStatus"],
): string {
  switch (status) {
    case "cache-hit":
      return "Cache hit";
    case "cache-miss":
      return "Cache miss";
    case "stale":
      return "Stale";
    default:
      return "Unknown";
  }
}

export function PrayerTimesDebug({
  cacheStatus,
  isRefreshing = false,
  locationLabel,
  methodLabel,
  nextPrayer,
  onRefresh,
  onScheduleNotifications,
  schoolLabel,
  timezone,
  todayTimes,
}: PrayerTimesDebugProps) {
  return (
    <View
      className="rounded-2xl border border-neutral bg-surface"
      style={{ gap: 16, padding: 16 }}
    >
      <Text
        className="font-sans text-ink"
        selectable
        style={{ fontSize: 16, fontWeight: "600" }}
      >
        Prayer times debug
      </Text>

      <View style={{ gap: 6 }}>
        <DebugLine label="Location" value={locationLabel} />
        <DebugLine label="Timezone" value={timezone} />
        <DebugLine label="Method" value={methodLabel} />
        <DebugLine label="School" value={schoolLabel} />
        <DebugLine label="Cache" value={cacheStatusLabel(cacheStatus)} />
      </View>

      <View style={{ gap: 8 }}>
        <Text
          className="font-sans text-tertiary"
          selectable
          style={{ fontSize: 12, fontWeight: "600" }}
        >
          Today times
        </Text>
        {PRAYER_ORDER.map((prayer) => (
          <DebugLine
            key={prayer}
            label={titleCasePrayer(prayer)}
            value={todayTimes[prayer]}
          />
        ))}
      </View>

      <View style={{ gap: 6 }}>
        <Text
          className="font-sans text-tertiary"
          selectable
          style={{ fontSize: 12, fontWeight: "600" }}
        >
          Next prayer
        </Text>
        <Text
          className="font-sans text-ink"
          selectable
          style={{ fontSize: 14 }}
        >
          {nextPrayer
            ? `${titleCasePrayer(nextPrayer.name)} at ${nextPrayer.time}`
            : "No upcoming prayer"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <DebugButton
          disabled={isRefreshing}
          label={isRefreshing ? "Refreshing..." : "Refresh"}
          onPress={onRefresh}
        />
        <DebugButton
          label="Schedule notifications"
          onPress={onScheduleNotifications}
        />
      </View>
    </View>
  );
}

function DebugButton({
  disabled = false,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: disabled ? "#E5E7EB" : "#29603E",
        borderRadius: 12,
        flex: 1,
        minHeight: 44,
        justifyContent: "center",
        opacity: disabled ? 0.7 : 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text
        className="font-sans"
        selectable
        style={{
          color: disabled ? "#6B7280" : "#FFFFFF",
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DebugLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text
        className="font-sans text-tertiary"
        selectable
        style={{ fontSize: 13 }}
      >
        {label}
      </Text>
      <Text
        className="font-sans text-ink"
        selectable
        style={{ fontSize: 13, fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
    </View>
  );
}

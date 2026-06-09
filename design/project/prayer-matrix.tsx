import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { Text, View } from "react-native";
import { useTheme } from "@/contexts/theme-context";

interface Props {
  days: { date: string; label: string }[];
  getStatus: (
    date: string,
    prayer: LoggablePrayerName
  ) => PrayerStatus | undefined;
  surface?: string;
  todayKey: string;
}

const PRAYERS: { key: LoggablePrayerName; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

const ROW_LABEL_WIDTH = 78;
const CELL_GAP = 6;

export function PrayerMatrix({ days, todayKey, getStatus, surface }: Props) {
  const { colors } = useTheme();
  const cardBg = surface ?? colors.card;

  const cellStyle = (status: PrayerStatus | undefined, isPast: boolean) => {
    if (status === "on_time") {
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      };
    }
    if (status === "late") {
      return {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
      };
    }
    if (status === "qada") {
      return {
        backgroundColor: "transparent",
        borderColor: colors.primary,
        borderStyle: "dashed" as const,
      };
    }
    if (status === "missed" || isPast) {
      return {
        backgroundColor: colors.inkSubtle,
        borderColor: "transparent",
        opacity: 0.18,
      };
    }
    return {
      backgroundColor: "transparent",
      borderColor: colors.border,
    };
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: ROW_LABEL_WIDTH,
          paddingRight: 14,
          marginBottom: 10,
        }}
      >
        {days.map((d) => {
          const isToday = d.date === todayKey;
          return (
            <View
              key={d.date}
              style={{
                width: 28,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.4,
                  color: isToday ? colors.primary : colors.inkMuted,
                  textTransform: "uppercase",
                }}
              >
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: cardBg,
          paddingVertical: 14,
          paddingRight: 14,
          paddingLeft: 14,
        }}
      >
        {PRAYERS.map((p, rowIdx) => (
          <View
            key={p.key}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              borderTopWidth: rowIdx === 0 ? 0 : 1,
              borderTopColor: colors.divider,
            }}
          >
            <View style={{ width: ROW_LABEL_WIDTH - 14 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.ink,
                }}
              >
                {p.label}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                gap: CELL_GAP,
              }}
            >
              {days.map((d) => {
                const status = getStatus(d.date, p.key);
                const isToday = d.date === todayKey;
                const isPast = d.date < todayKey;
                const style = cellStyle(status, isPast && !status);
                return (
                  <View
                    key={d.date}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      borderWidth: 1,
                      ...style,
                      ...(isToday && !status
                        ? { borderColor: colors.primary }
                        : null),
                    }}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 14,
          marginTop: 12,
          paddingHorizontal: 4,
        }}
      >
        <LegendDot color={colors.primary} label="On time" />
        <LegendDot
          borderColor={colors.primary}
          color={colors.primarySoft}
          label="Late"
        />
        <LegendDot
          borderColor={colors.primary}
          color="transparent"
          dashed
          label="Qaḍāʾ"
        />
        <LegendDot color={colors.inkSubtle} label="Missed" opacity={0.18} />
      </View>
    </View>
  );
}

function LegendDot({
  color,
  borderColor,
  dashed,
  opacity,
  label,
}: {
  color: string;
  borderColor?: string;
  dashed?: boolean;
  opacity?: number;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: borderColor ?? "transparent",
          borderStyle: dashed ? "dashed" : "solid",
          opacity: opacity ?? 1,
        }}
      />
      <Text style={{ fontSize: 11, color: colors.inkMuted }}>{label}</Text>
    </View>
  );
}

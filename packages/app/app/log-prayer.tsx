import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import {
  useClearPrayer,
  useLogPrayer,
  useWeekLogs,
} from "@/hooks/usePrayerLogs";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const BARAKAH_GREEN = "#29603E";

const PRAYER_ORDER: LoggablePrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

const PRAYER_LABEL: Record<LoggablePrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const STATUS_LABEL: Record<PrayerStatus, string> = {
  on_time: "On time",
  late: "Late",
  qada: "Qadā",
  missed: "Missed",
};

const STATUS_HINT: Record<PrayerStatus, string> = {
  on_time: "Prayed inside the window.",
  late: "Prayed after the window closed.",
  qada: "Made up after the day passed.",
  missed: "Did not pray this one.",
};

const LOG_STATUS_OPTIONS: PrayerStatus[] = [
  "on_time",
  "late",
  "qada",
  "missed",
];

const ROMAN_NUMERALS = ["i", "ii", "iii", "iv"] as const;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function fmtRangeTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "p" : "a";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)}${period}`;
}

export default function LogPrayerScreen() {
  const params = useLocalSearchParams<{
    prayer?: LoggablePrayerName;
    date?: string;
  }>();
  const prayer = params.prayer;
  const date = params.date;

  const { colors } = useTheme();
  const { todayPrayerTimes, prayerTimes } = usePrayerTimes();
  const week = useWeekLogs(date ?? "");
  const logPrayer = useLogPrayer();
  const clearPrayer = useClearPrayer();

  const existing = prayer && date ? week.getStatus(date, prayer) : undefined;

  const rangeStart = useMemo<Date | null>(() => {
    if (!(todayPrayerTimes && prayer)) {
      return null;
    }
    const [h, m] = todayPrayerTimes.timings[prayer].split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return null;
    }
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [todayPrayerTimes, prayer]);

  const rangeEnd = useMemo<Date | null>(() => {
    if (!prayer) {
      return null;
    }
    const idx = PRAYER_ORDER.indexOf(prayer);
    if (idx < PRAYER_ORDER.length - 1) {
      if (!todayPrayerTimes) {
        return null;
      }
      const next = PRAYER_ORDER[idx + 1];
      const [h, m] = todayPrayerTimes.timings[next].split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) {
        return null;
      }
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    const i = prayerTimes.findIndex((d) => d.date === date);
    const tomorrowFajr =
      i >= 0 ? (prayerTimes[i + 1]?.timings.fajr ?? null) : null;
    if (!tomorrowFajr) {
      return null;
    }
    const [h, m] = tomorrowFajr.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return null;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(h, m, 0, 0);
    return d;
  }, [prayer, todayPrayerTimes, prayerTimes, date]);

  if (!(prayer && date)) {
    return null;
  }

  const isDark = colors.bg === "#000000";
  const sheetBg = isDark ? "#0E1311" : "#FBFBF8";
  const fg = isDark ? "#F7F7F4" : "#0F1311";
  const muted = isDark ? "#A1A1AA" : "#6B7280";
  const subtle = isDark ? "#5E5E62" : "#B8BCB6";
  const hairline = isDark ? "rgba(255,255,255,0.09)" : "rgba(15,19,17,0.09)";
  const pressedBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(15,19,17,0.04)";
  const accent = BARAKAH_GREEN;

  const rangeText =
    rangeStart && rangeEnd
      ? `Begins ${fmtRangeTime(rangeStart)} · ends ${fmtRangeTime(rangeEnd)}`
      : "Window pending";

  const handlePick = (status: PrayerStatus) => {
    logPrayer({
      date,
      prayer,
      status,
      prayedAt: Date.now(),
    })
      .then(() => router.back())
      .catch(() => undefined);
  };

  const handleClear = () => {
    clearPrayer({ date, prayer })
      .then(() => router.back())
      .catch(() => undefined);
  };

  return (
    <View style={{ flex: 1, backgroundColor: sheetBg }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.6,
            color: muted,
          }}
        >
          Log prayer
        </Text>
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 40,
            lineHeight: 46,
            color: fg,
            marginTop: 6,
          }}
        >
          {PRAYER_LABEL[prayer]}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: muted,
            fontVariant: ["tabular-nums"],
            marginTop: 6,
          }}
        >
          {rangeText}
        </Text>
      </View>

      <View
        style={{
          height: 1,
          marginTop: 22,
          marginHorizontal: 24,
          backgroundColor: hairline,
        }}
      />

      <View>
        {LOG_STATUS_OPTIONS.map((statusOption, idx) => {
          const selected = existing === statusOption;
          const isLast = idx === LOG_STATUS_OPTIONS.length - 1;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={statusOption}
              onPress={() => handlePick(statusOption)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 18,
                paddingHorizontal: 24,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: hairline,
                backgroundColor: pressed ? pressedBg : "transparent",
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 18,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontFamily: "LibreBaskerville-Bold",
                    fontSize: 13,
                    color: selected ? accent : subtle,
                    width: 22,
                    paddingTop: 3,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {ROMAN_NUMERALS[idx]}
                </Text>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: selected ? "700" : "600",
                      color: selected ? accent : fg,
                    }}
                  >
                    {STATUS_LABEL[statusOption]}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 16,
                      color: muted,
                    }}
                  >
                    {STATUS_HINT[statusOption]}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: selected ? accent : subtle,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selected ? accent : "transparent",
                  marginTop: 4,
                }}
              >
                {selected ? (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {existing ? (
        <View
          style={{
            marginTop: 14,
            marginHorizontal: 24,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: hairline,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              flex: 1,
              color: muted,
              fontSize: 12,
              lineHeight: 17,
            }}
          >
            Currently {STATUS_LABEL[existing].toLowerCase()}
          </Text>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => ({
              paddingHorizontal: 4,
              paddingVertical: 9,
              backgroundColor: pressed ? pressedBg : "transparent",
            })}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: muted,
                textDecorationLine: "underline",
              }}
            >
              Clear log
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

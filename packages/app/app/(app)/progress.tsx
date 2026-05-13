import type { LoggablePrayerName, PrayerStatus } from "@barakah/core/prayer";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AreaChart } from "@/components/area-chart";
import { PrayerMatrix } from "@/components/prayer-matrix";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { useTheme } from "@/contexts/theme-context";
import { useWeekLogs, type WeekLogs } from "@/hooks/usePrayerLogs";

const USE_DEV_DUMMY = (globalThis as { __DEV__?: boolean }).__DEV__ ?? false;

const DEV_DUMMY_STATUSES: Record<
  number,
  Partial<Record<LoggablePrayerName, PrayerStatus>>
> = {
  0: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "on_time",
  },
  1: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "late",
    maghrib: "on_time",
    isha: "on_time",
  },
  2: {
    fajr: "late",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "qada",
  },
  3: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "on_time",
  },
  4: {
    fajr: "missed",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
    isha: "on_time",
  },
  5: {
    fajr: "on_time",
    dhuhr: "on_time",
    asr: "on_time",
    maghrib: "on_time",
  },
  6: {},
};

function buildDummyWeek(days: { date: string }[]): WeekLogs {
  const map = new Map<string, PrayerStatus>();
  let onTime = 0;
  let late = 0;
  let qada = 0;
  let missed = 0;
  let total = 0;
  days.forEach((d, idx) => {
    const row = DEV_DUMMY_STATUSES[idx] ?? {};
    for (const p of PRAYERS) {
      const s = row[p];
      if (!s) {
        continue;
      }
      map.set(`${d.date}|${p}`, s);
      total += 1;
      if (s === "on_time") {
        onTime += 1;
      } else if (s === "late") {
        late += 1;
      } else if (s === "qada") {
        qada += 1;
      } else {
        missed += 1;
      }
    }
  });
  return {
    rows: [],
    getStatus: (date, prayer) => map.get(`${date}|${prayer}`),
    onTimeCount: onTime,
    lateCount: late,
    qadaCount: qada,
    missedCount: missed,
    totalLogged: total,
    loading: false,
  };
}

const PRAYERS: LoggablePrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function mondayOf(d: Date): Date {
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(d, offset);
}

export default function Progress() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const { todayKey, days, startKey, rangeLabel } = useMemo(() => {
    const now = new Date();
    const today = dateKey(now);
    const start = mondayOf(now);
    const list = Array.from({ length: 7 }, (_, i) => {
      const dt = addDays(start, i);
      return { date: dateKey(dt), label: DAY_LABELS[i], jsDate: dt };
    });
    const first = list[0].jsDate;
    const last = list.at(-1)?.jsDate ?? first;
    const sameMonth = first.getMonth() === last.getMonth();
    const range = sameMonth
      ? `${MONTH_SHORT[first.getMonth()]} ${first.getDate()} – ${last.getDate()}`
      : `${MONTH_SHORT[first.getMonth()]} ${first.getDate()} – ${MONTH_SHORT[last.getMonth()]} ${last.getDate()}`;
    return {
      todayKey: today,
      days: list,
      startKey: list[0].date,
      rangeLabel: range,
    };
  }, []);

  const realWeek = useWeekLogs(startKey);
  const week = useMemo<WeekLogs>(
    () => (USE_DEV_DUMMY ? buildDummyWeek(days) : realWeek),
    [days, realWeek]
  );

  const dailyOnTime = useMemo(
    () =>
      days.map((d) => {
        let count = 0;
        for (const p of PRAYERS) {
          if (week.getStatus(d.date, p) === "on_time") {
            count += 1;
          }
        }
        return { label: d.label, value: count };
      }),
    [days, week]
  );

  const possible = days.length * PRAYERS.length;
  const onTime = week.onTimeCount;

  const { currentStreak, longestStreak } = useMemo(() => {
    const dayHasOnTime = (date: string) =>
      PRAYERS.some((p) => week.getStatus(date, p) === "on_time");
    let longest = 0;
    let run = 0;
    for (const d of days) {
      if (dayHasOnTime(d.date)) {
        run += 1;
        if (run > longest) {
          longest = run;
        }
      } else {
        run = 0;
      }
    }
    let current = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i];
      if (d.date > todayKey) {
        continue;
      }
      if (dayHasOnTime(d.date)) {
        current += 1;
      } else {
        break;
      }
    }
    return { currentStreak: current, longestStreak: longest };
  }, [days, todayKey, week]);

  const empty = !week.loading && week.totalLogged === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            This week
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              lineHeight: 34,
              color: colors.ink,
            }}
          >
            {empty ? "Begin this week." : "Mā shāʾ Allāh."}
          </Text>
          <Text style={{ fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
            {rangeLabel}
          </Text>
        </View>

        {/* Hero count */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 24,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 64,
              lineHeight: 68,
              color: colors.ink,
              fontVariant: ["tabular-nums"],
            }}
          >
            {onTime}
            <Text style={{ color: colors.inkSubtle }}>/{possible}</Text>
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              color: colors.inkMuted,
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            On-time prayers
          </Text>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginHorizontal: 20,
          }}
        />

        {/* Daily chart */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 16,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Daily on-time
            </Text>
            <Text style={{ fontSize: 11, color: colors.inkMuted }}>
              last 7 days
            </Text>
          </View>
          <AreaChart
            data={dailyOnTime}
            fill={colors.primary}
            max={5}
            stroke={colors.primary}
          />
        </View>

        {/* Matrix */}
        <View style={{ marginTop: 28, gap: 14 }}>
          <Text
            style={{
              paddingHorizontal: 20,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            By prayer
          </Text>
          <PrayerMatrix
            days={days}
            getStatus={week.getStatus}
            todayKey={todayKey}
          />
        </View>

        {/* Streak strip */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: 20,
            paddingVertical: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.8,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Current streak
            </Text>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 26,
                lineHeight: 30,
                color: colors.ink,
                fontVariant: ["tabular-nums"],
              }}
            >
              {currentStreak}
              <Text style={{ fontSize: 14, color: colors.inkMuted }}>
                {" "}
                {currentStreak === 1 ? "day" : "days"}
              </Text>
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.8,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Longest
            </Text>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 26,
                lineHeight: 30,
                color: colors.ink,
                fontVariant: ["tabular-nums"],
              }}
            >
              {longestStreak}
              <Text style={{ fontSize: 14, color: colors.inkMuted }}>
                {" "}
                {longestStreak === 1 ? "day" : "days"}
              </Text>
            </Text>
          </View>
        </View>

        {empty ? (
          <Text
            style={{
              marginHorizontal: 20,
              marginTop: 18,
              fontSize: 13,
              color: colors.inkMuted,
              textAlign: "center",
            }}
          >
            Log your prayers and watch this week take shape, in shāʾ Allāh.
          </Text>
        ) : null}
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}

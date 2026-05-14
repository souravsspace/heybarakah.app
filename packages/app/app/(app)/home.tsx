import { api } from "@barakah/core/convex/_generated/api";
import {
  classifyPrayerStatus,
  type LoggablePrayerName,
  type PrayerDay,
  type PrayerStatus,
} from "@barakah/core/prayer";
import { useMutation, useQuery } from "convex/react";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import {
  useClearPrayer,
  useLogPrayer,
  useWeekLogs,
} from "@/hooks/usePrayerLogs";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

type PrayerName = LoggablePrayerName;

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const PRAYER_LABEL: Record<PrayerName, string> = {
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const HIJRI_MONTHS = [
  "Muḥarram",
  "Ṣafar",
  "Rabīʿ I",
  "Rabīʿ II",
  "Jumādā I",
  "Jumādā II",
  "Rajab",
  "Shaʿbān",
  "Ramaḍān",
  "Shawwāl",
  "Dhū al-Qaʿdah",
  "Dhū al-Ḥijjah",
];

function formatHijri(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const parts = raw.split("-");
  if (parts.length !== 3) {
    return raw;
  }
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = parts[2];
  if (Number.isNaN(day) || Number.isNaN(month)) {
    return raw;
  }
  const name = HIJRI_MONTHS[month - 1] ?? `M${month}`;
  return `${day} ${name} ${year}`;
}

function formatDateLine(date: Date): string {
  return date
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
}

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return time;
  }
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${period}`;
}

function fmt12FromDate(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${period}`;
}

function fmtRangeTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "p" : "a";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)}${period}`;
}

function windowProgress(start: Date | null, end: Date | null): number {
  if (!(start && end)) {
    return 0;
  }
  const total = end.getTime() - start.getTime();
  if (total <= 0) {
    return 0;
  }
  const elapsed = Date.now() - start.getTime();
  return Math.max(0, Math.min(1, elapsed / total));
}

function activePrayerNow(day: PrayerDay | null): PrayerName | null {
  if (!day) {
    return null;
  }
  const now = new Date();
  let active: PrayerName | null = null;
  for (const name of PRAYER_ORDER) {
    const [h, m] = day.timings[name].split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      continue;
    }
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    if (at <= now) {
      active = name;
    }
  }
  return active;
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!target) {
      return;
    }
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) {
    return null;
  }
  let diff = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(diff / 3_600_000);
  diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000);
  diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  return { h, m, s };
}

export default function Home() {
  const { state, dispatch } = useOnboardingState();
  const { user } = useUser();
  const profile = useQuery(api.lib.users.getMyProfile);
  const upsertProfile = useMutation(api.lib.users.upsertProfile);
  const uploadedRef = useRef(false);
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  useEffect(() => {
    if (uploadedRef.current) {
      return;
    }
    if (profile === undefined || !state.hydrated) {
      return;
    }
    if (profile === null && state.completedAt) {
      uploadedRef.current = true;
      upsertProfile({
        name: state.name,
        gender: state.gender,
        madhab: state.madhab,
        consistency: state.consistency,
        struggle: state.struggle,
        goal: state.goal,
        calcMethod: state.calcMethod,
        strictness: state.strictness,
        locationGranted: state.locationGranted,
        notifGranted: state.notifGranted,
        prayersToLock: state.prayersToLock,
        completedAt: state.completedAt,
      })
        .then(() => dispatch({ type: "RESET" }))
        .catch(() => {
          uploadedRef.current = false;
        });
      return;
    }
    if (profile !== null && (state.completedAt || state.gender)) {
      uploadedRef.current = true;
      dispatch({ type: "RESET" });
    }
  }, [profile, state, dispatch, upsertProfile]);

  const name =
    profile?.name?.trim() ||
    state.name?.trim() ||
    user?.name?.trim() ||
    "friend";

  const { todayPrayerTimes, nextPrayer, location, loading, prayerTimes } =
    usePrayerTimes();
  const active = useMemo(
    () => activePrayerNow(todayPrayerTimes),
    [todayPrayerTimes]
  );
  const countdown = useCountdown(nextPrayer?.at ?? null);
  const hijri = todayPrayerTimes?.hijriDate ?? null;

  const today = todayKey();
  const gregLine = formatDateLine(new Date());
  const hijriLine = formatHijri(hijri);
  const dateLine = hijriLine ? `${gregLine}  ·  ${hijriLine}` : gregLine;

  const realWeek = useWeekLogs(today);
  const logPrayer = useLogPrayer();
  const clearPrayer = useClearPrayer();

  const prayedAtFor = useCallback(
    (prayer: PrayerName): number | null => {
      const row = realWeek.rows.find(
        (r) => r.date === today && r.prayer === prayer
      );
      return row?.prayedAt ?? null;
    },
    [realWeek.rows, today]
  );

  const loggedToday = useMemo(
    () =>
      PRAYER_ORDER.reduce(
        (n, p) => n + (realWeek.getStatus(today, p) ? 1 : 0),
        0
      ),
    [realWeek, today]
  );

  const weekDates = useMemo(() => {
    const out: { key: string; label: string; dayNum: number }[] = [];
    const base = new Date(`${today}T00:00:00`);
    const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push({
        key: d.toISOString().slice(0, 10),
        label: dayLetters[d.getDay()],
        dayNum: d.getDate(),
      });
    }
    return out;
  }, [today]);

  const tomorrowFajr = useMemo(() => {
    const idx = prayerTimes.findIndex((d) => d.date === today);
    return idx >= 0 ? (prayerTimes[idx + 1]?.timings.fajr ?? null) : null;
  }, [prayerTimes, today]);

  const timezone = location?.timezone ?? null;

  const classifyNow = useCallback(
    (prayer: PrayerName): PrayerStatus => {
      if (!(todayPrayerTimes && timezone)) {
        return "on_time";
      }
      try {
        return classifyPrayerStatus({
          prayedAt: Date.now(),
          prayer,
          schedule: todayPrayerTimes.timings,
          dateKey: today,
          timezone,
          nextDayFajr: tomorrowFajr ?? undefined,
        });
      } catch {
        return "on_time";
      }
    },
    [todayPrayerTimes, timezone, today, tomorrowFajr]
  );

  const [sheet, setSheet] = useState<PrayerName | null>(null);

  const onMarkPrayed = useCallback(
    async (prayer: PrayerName) => {
      const status = classifyNow(prayer);
      await logPrayer({
        date: today,
        prayer,
        status,
        prayedAt: Date.now(),
      });
    },
    [classifyNow, logPrayer, today]
  );

  const onPickStatus = useCallback(
    async (prayer: PrayerName, status: PrayerStatus) => {
      await logPrayer({
        date: today,
        prayer,
        status,
        prayedAt: Date.now(),
      });
      setSheet(null);
    },
    [logPrayer, today]
  );

  const onClear = useCallback(
    async (prayer: PrayerName) => {
      await clearPrayer({ date: today, prayer });
      setSheet(null);
    },
    [clearPrayer, today]
  );

  const prayerDateFor = useCallback(
    (prayer: PrayerName): Date | null => {
      if (!todayPrayerTimes) {
        return null;
      }
      const [h, m] = todayPrayerTimes.timings[prayer].split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) {
        return null;
      }
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    },
    [todayPrayerTimes]
  );

  const windowEndFor = useCallback(
    (prayer: PrayerName): Date | null => {
      const idx = PRAYER_ORDER.indexOf(prayer);
      if (idx < PRAYER_ORDER.length - 1) {
        return prayerDateFor(PRAYER_ORDER[idx + 1]);
      }
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
    },
    [prayerDateFor, tomorrowFajr]
  );

  const activeUnlogged =
    active && !realWeek.getStatus(today, active) ? active : null;

  const heroLabel = activeUnlogged ? "In progress" : "Next prayer";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: 140,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting: single combined date line */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, gap: 8 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2,
              color: colors.inkMuted,
            }}
          >
            {dateLine}
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 26,
              lineHeight: 32,
              color: colors.ink,
            }}
          >
            Assalāmu ʿalaykum,{"\n"}
            {name}.
          </Text>
        </View>

        {/* Focal card: hairline border, paper bg, accent only on ghost pill */}
        <View
          style={{
            marginTop: 22,
            marginHorizontal: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: "hidden",
          }}
        >
          <View style={{ padding: 22, gap: 14 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 2,
                  color: activeUnlogged ? colors.primary : colors.inkMuted,
                  textTransform: "uppercase",
                }}
              >
                {heroLabel}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.6,
                  color: colors.inkSubtle,
                  textTransform: "uppercase",
                }}
              >
                {location?.city ?? "Locating…"}
              </Text>
            </View>

            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontFamily: "LibreBaskerville-Bold",
                  color: colors.ink,
                  fontSize: 48,
                  lineHeight: 52,
                }}
              >
                {activeUnlogged
                  ? PRAYER_LABEL[activeUnlogged]
                  : nextPrayer
                    ? PRAYER_LABEL[nextPrayer.name]
                    : "—"}
              </Text>
              <Text
                style={{
                  color: colors.inkMuted,
                  fontSize: 18,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {activeUnlogged && todayPrayerTimes
                  ? fmt12(todayPrayerTimes.timings[activeUnlogged])
                  : nextPrayer
                    ? fmt12(nextPrayer.time)
                    : "Loading…"}
              </Text>
            </View>

            {countdown && !activeUnlogged ? (
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                  color: colors.inkMuted,
                  textTransform: "uppercase",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {`in ${countdown.h}h ${pad(countdown.m)}m ${pad(countdown.s)}s`}
              </Text>
            ) : null}
          </View>

          {activeUnlogged ? (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                paddingHorizontal: 22,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: colors.inkMuted,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                You are inside the window.
              </Text>
              <Pressable
                onPress={() => {
                  onMarkPrayed(activeUnlogged).catch(() => undefined);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  backgroundColor: pressed ? colors.primarySoft : "transparent",
                })}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 13,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                  }}
                >
                  I prayed
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Today ledger: typeset prayer schedule */}
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: 32,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 2.4,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Today
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkSubtle,
                textTransform: "uppercase",
                fontVariant: ["tabular-nums"],
              }}
            >
              {`${loggedToday} of 5 logged`}
            </Text>
          </View>

          <View>
            {PRAYER_ORDER.map((pname, i) => {
              const status = realWeek.getStatus(today, pname);
              const start = prayerDateFor(pname);
              const end = windowEndFor(pname);
              const isPast = start ? start.getTime() <= Date.now() : false;
              const isActive = activeUnlogged === pname;
              return (
                <LedgerRow
                  colors={colors}
                  isActive={isActive}
                  isFirst={i === 0}
                  isPast={isPast}
                  key={pname}
                  loading={loading}
                  onPress={() => {
                    if (isActive) {
                      onMarkPrayed(pname).catch(() => undefined);
                      return;
                    }
                    if (isPast || status) {
                      setSheet(pname);
                    }
                  }}
                  prayedAt={prayedAtFor(pname)}
                  prayer={pname}
                  progress={windowProgress(start, end)}
                  rangeEnd={end}
                  rangeStart={start}
                  status={status}
                  time={todayPrayerTimes?.timings[pname]}
                />
              );
            })}
          </View>
        </View>

        <WeekPulse
          colors={colors}
          dates={weekDates}
          getStatus={realWeek.getStatus}
          today={today}
          totalLogged={realWeek.totalLogged}
        />
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />

      <LogSheet
        colors={colors}
        existing={sheet ? realWeek.getStatus(today, sheet) : undefined}
        onClear={onClear}
        onClose={() => setSheet(null)}
        onPick={onPickStatus}
        prayer={sheet}
      />
    </View>
  );
}

function LedgerRow({
  colors,
  prayer,
  time,
  rangeStart,
  rangeEnd,
  isActive,
  isPast,
  isFirst,
  status,
  prayedAt,
  loading,
  progress,
  onPress,
}: {
  colors: ThemeColors;
  prayer: PrayerName;
  time: string | undefined;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  isActive: boolean;
  isPast: boolean;
  isFirst: boolean;
  status: PrayerStatus | undefined;
  prayedAt: number | null;
  loading: boolean;
  progress: number;
  onPress: () => void;
}) {
  const rangeText =
    rangeStart && rangeEnd
      ? `BEGINS ${fmtRangeTime(rangeStart).toUpperCase()} · ENDS ${fmtRangeTime(rangeEnd).toUpperCase()}`
      : "WINDOW PENDING";

  const nameColor =
    status === "missed"
      ? colors.inkSubtle
      : isActive
        ? colors.primary
        : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 22,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: colors.divider,
        backgroundColor: pressed ? colors.neutralSoft : "transparent",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <View style={{ flex: 1, gap: 9 }}>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 22,
              lineHeight: 26,
              color: nameColor,
            }}
          >
            {PRAYER_LABEL[prayer]}
          </Text>
          <View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkSubtle,
                fontVariant: ["tabular-nums"],
              }}
            >
              {rangeText}
            </Text>
            {isActive ? (
              <View
                style={{
                  height: 1,
                  marginTop: 5,
                  backgroundColor: colors.divider,
                }}
              >
                <View
                  style={{
                    height: 1,
                    width: `${Math.max(4, progress * 100)}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View
          style={{
            alignItems: "flex-end",
            minWidth: 96,
            paddingTop: 4,
          }}
        >
          <RightAtom
            colors={colors}
            isActive={isActive}
            isPast={isPast}
            loading={loading}
            prayedAt={prayedAt}
            status={status}
            time={time}
          />
        </View>
      </View>
    </Pressable>
  );
}

function RightAtom({
  colors,
  status,
  time,
  prayedAt,
  isActive,
  isPast,
  loading,
}: {
  colors: ThemeColors;
  status: PrayerStatus | undefined;
  time: string | undefined;
  prayedAt: number | null;
  isActive: boolean;
  isPast: boolean;
  loading: boolean;
}) {
  if (!status) {
    return (
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
          color: isActive
            ? colors.primary
            : isPast
              ? colors.inkSubtle
              : colors.ink,
        }}
      >
        {time ? fmt12(time) : loading ? "…" : "—"}
      </Text>
    );
  }
  if (status === "on_time") {
    return (
      <View style={{ alignItems: "flex-end", gap: 3 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: colors.primary,
            letterSpacing: 0.4,
            fontVariant: ["tabular-nums"],
          }}
        >
          {prayedAt ? `prayed ${fmt12FromDate(new Date(prayedAt))}` : "prayed"}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: colors.inkSubtle,
            fontVariant: ["tabular-nums"],
          }}
        >
          {time ? fmt12(time) : ""}
        </Text>
      </View>
    );
  }
  if (status === "late") {
    return (
      <View style={{ alignItems: "flex-end", gap: 3 }}>
        <Text
          style={{
            fontSize: 11,
            color: colors.inkMuted,
            fontStyle: "italic",
            fontVariant: ["tabular-nums"],
          }}
        >
          {prayedAt ? `late · ${fmt12FromDate(new Date(prayedAt))}` : "late"}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: colors.inkSubtle,
            fontVariant: ["tabular-nums"],
          }}
        >
          {time ? fmt12(time) : ""}
        </Text>
      </View>
    );
  }
  if (status === "qada") {
    return (
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: colors.inkMuted,
          letterSpacing: 1.6,
        }}
      >
        QADĀ
      </Text>
    );
  }
  return (
    <Text
      style={{
        fontSize: 11,
        color: colors.inkSubtle,
        fontStyle: "italic",
      }}
    >
      passed
    </Text>
  );
}

function WeekPulse({
  colors,
  dates,
  getStatus,
  today,
  totalLogged,
}: {
  colors: ThemeColors;
  dates: { key: string; label: string; dayNum: number }[];
  getStatus: (date: string, prayer: PrayerName) => PrayerStatus | undefined;
  today: string;
  totalLogged: number;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        marginTop: 36,
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
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
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1.6,
            color: colors.inkSubtle,
            textTransform: "uppercase",
            fontVariant: ["tabular-nums"],
          }}
        >
          {`${totalLogged} prayers`}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          paddingVertical: 14,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        {dates.map((d) => {
          const isToday = d.key === today;
          const isPast = d.key < today;
          return (
            <View
              key={d.key}
              style={{
                flex: 1,
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.2,
                  color: isToday ? colors.primary : colors.inkSubtle,
                  textTransform: "uppercase",
                }}
              >
                {d.label}
              </Text>
              <View style={{ gap: 5, alignItems: "center" }}>
                {PRAYER_ORDER.map((p) => {
                  const s = getStatus(d.key, p);
                  return (
                    <PulseDot
                      colors={colors}
                      isFuture={!(isPast || isToday)}
                      isPast={isPast}
                      key={p}
                      status={s}
                    />
                  );
                })}
              </View>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: isToday ? colors.primary : colors.inkSubtle,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {d.dayNum}
              </Text>
              {isToday ? (
                <View
                  style={{
                    height: 1,
                    width: 14,
                    backgroundColor: colors.primary,
                    marginTop: -4,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <Text
        style={{
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 14,
          lineHeight: 22,
          color: colors.inkMuted,
          textAlign: "center",
          paddingHorizontal: 8,
          marginTop: 4,
          fontWeight: "400",
        }}
      >
        “Indeed, prayer prohibits immorality and wrongdoing.”
      </Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 2,
          color: colors.inkSubtle,
          textTransform: "uppercase",
          textAlign: "center",
          marginTop: -10,
        }}
      >
        Qur'an 29:45
      </Text>
    </View>
  );
}

function PulseDot({
  colors,
  status,
  isPast,
  isFuture,
}: {
  colors: ThemeColors;
  status: PrayerStatus | undefined;
  isPast: boolean;
  isFuture: boolean;
}) {
  if (status === "on_time") {
    return (
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.primary,
        }}
      />
    );
  }
  if (status === "late" || status === "qada") {
    return (
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          borderWidth: 1,
          borderColor: colors.primary,
        }}
      />
    );
  }
  if (status === "missed" || isPast) {
    return (
      <View
        style={{
          width: 6,
          height: 1,
          backgroundColor: colors.inkSubtle,
        }}
      />
    );
  }
  if (isFuture) {
    return (
      <View
        style={{
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: colors.divider,
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.divider,
      }}
    />
  );
}

function LogSheet({
  prayer,
  existing,
  colors,
  onPick,
  onClear,
  onClose,
}: {
  prayer: PrayerName | null;
  existing: PrayerStatus | undefined;
  colors: ThemeColors;
  onPick: (p: PrayerName, s: PrayerStatus) => void;
  onClear: (p: PrayerName) => void;
  onClose: () => void;
}) {
  const open = !!prayer;
  const options: PrayerStatus[] = ["on_time", "late", "qada", "missed"];
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={open}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.42)" }}
      />
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginBottom: 16,
          }}
        />
        <View style={{ paddingHorizontal: 24, gap: 4, marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            Log prayer
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 22,
              color: colors.ink,
            }}
          >
            {prayer ? PRAYER_LABEL[prayer] : ""}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          {options.map((s, i) => {
            const selected = existing === s;
            return (
              <Pressable
                key={s}
                onPress={() => prayer && onPick(prayer, s)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.divider,
                  backgroundColor: pressed ? colors.neutralSoft : "transparent",
                })}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: colors.inkSubtle,
                      width: 14,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {i + 1}
                  </Text>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: selected ? "700" : "500",
                      color: selected ? colors.primary : colors.ink,
                    }}
                  >
                    {STATUS_LABEL[s]}
                  </Text>
                </View>
                {selected ? (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: colors.primary,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                    }}
                  >
                    Current
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {existing ? (
          <Pressable
            onPress={() => prayer && onClear(prayer)}
            style={({ pressed }) => ({
              marginTop: 8,
              marginHorizontal: 24,
              paddingVertical: 14,
              alignItems: "center",
              borderRadius: 14,
              backgroundColor: pressed ? colors.neutralSoft : "transparent",
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: colors.inkMuted,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Clear log
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

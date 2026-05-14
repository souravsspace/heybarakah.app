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

const LOG_STATUS_OPTIONS: PrayerStatus[] = [
  "on_time",
  "late",
  "qada",
  "missed",
];

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
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
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

  const loggedToday = useMemo(
    () =>
      PRAYER_ORDER.reduce(
        (n, p) => n + (realWeek.getStatus(today, p) ? 1 : 0),
        0
      ),
    [realWeek, today]
  );

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
              fontSize: 11,
              fontWeight: "600",
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
                  fontSize: 12,
                  fontWeight: "600",
                  color: activeUnlogged ? colors.primary : colors.inkMuted,
                }}
              >
                {heroLabel}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.inkSubtle,
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
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.inkMuted,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {`In ${countdown.h}h ${pad(countdown.m)}m ${pad(countdown.s)}s`}
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
            marginHorizontal: 20,
            marginTop: 32,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
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
                fontSize: 13,
                fontWeight: "700",
                color: colors.inkMuted,
              }}
            >
              Today
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.inkSubtle,
                fontVariant: ["tabular-nums"],
              }}
            >
              {`${loggedToday} of 5 logged`}
            </Text>
          </View>

          <View>
            {PRAYER_ORDER.map((pname, index) => {
              const status = realWeek.getStatus(today, pname);
              const start = prayerDateFor(pname);
              const end = windowEndFor(pname);
              const isPast = start ? start.getTime() <= Date.now() : false;
              const isActive = activeUnlogged === pname;
              return (
                <View key={pname}>
                  <LedgerRow
                    colors={colors}
                    isActive={isActive}
                    isPast={isPast}
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
                    prayer={pname}
                    progress={windowProgress(start, end)}
                    rangeEnd={end}
                    rangeStart={start}
                    status={status}
                    time={todayPrayerTimes?.timings[pname]}
                  />
                  {index < PRAYER_ORDER.length - 1 ? (
                    <View
                      style={{
                        height: 1,
                        marginVertical: 8,
                        backgroundColor: colors.divider,
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
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
  status,
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
  status: PrayerStatus | undefined;
  loading: boolean;
  progress: number;
  onPress: () => void;
}) {
  const rangeText =
    rangeStart && rangeEnd
      ? `Begins ${fmtRangeTime(rangeStart)} · ends ${fmtRangeTime(rangeEnd)}`
      : "Window pending";

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
        borderWidth: 1,
        borderColor: isActive ? colors.primary : colors.border,
        borderRadius: 18,
        backgroundColor: pressed
          ? colors.neutralSoft
          : isActive
            ? colors.primarySoft
            : colors.card,
        paddingHorizontal: 18,
        paddingVertical: isActive ? 20 : 16,
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
              fontSize: isActive ? 30 : 22,
              lineHeight: isActive ? 36 : 26,
              color: nameColor,
            }}
          >
            {PRAYER_LABEL[prayer]}
          </Text>
          <View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.inkMuted,
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
  isActive,
  isPast,
  loading,
}: {
  colors: ThemeColors;
  status: PrayerStatus | undefined;
  time: string | undefined;
  isActive: boolean;
  isPast: boolean;
  loading: boolean;
}) {
  if (!status) {
    return (
      <Text
        style={{
          fontSize: isActive ? 24 : 18,
          fontFamily: isActive ? "LibreBaskerville-Bold" : undefined,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
          lineHeight: isActive ? 29 : 24,
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
    return <StatusAtom color={colors.primary} label={STATUS_LABEL[status]} />;
  }
  if (status === "late") {
    return <StatusAtom color={colors.inkMuted} label={STATUS_LABEL[status]} />;
  }
  if (status === "qada") {
    return <StatusAtom color={colors.inkMuted} label={STATUS_LABEL[status]} />;
  }
  return <StatusAtom color={colors.inkMuted} label={STATUS_LABEL[status]} />;
}

function StatusAtom({ color, label }: { color: string; label: string }) {
  return (
    <Text
      style={{
        color,
        fontSize: 12,
        fontWeight: "700",
      }}
    >
      {label}
    </Text>
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
  const insets = useSafeAreaInsets();
  const isDark = colors.bg === "#000000";
  const sheetBg = isDark ? "#141414" : "#FFFFFF";
  const pressedRowBg = isDark ? "#262626" : "#F4F4F2";
  const sheetFg = isDark ? "#F7F7F4" : "#0F1311";
  const sheetMuted = isDark ? "#A1A1AA" : "#6B7280";
  const sheetSubtle = isDark ? "#5E5E62" : "#E5E7EB";
  const selectedBg = "#29603E";
  const selectedFg = "#FFFFFF";
  const sheetPrimary = "#29603E";

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
          backgroundColor: sheetBg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 18) + 14,
          borderTopWidth: 1,
          borderTopColor: sheetSubtle,
        }}
      >
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: sheetSubtle,
            alignSelf: "center",
            marginBottom: 18,
          }}
        />
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: sheetMuted,
                }}
              >
                Log prayer
              </Text>
              <Text
                style={{
                  fontFamily: "LibreBaskerville-Bold",
                  fontSize: 26,
                  lineHeight: 31,
                  color: sheetFg,
                }}
              >
                {prayer ? PRAYER_LABEL[prayer] : ""}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                borderWidth: 1,
                borderColor: sheetSubtle,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: pressed ? pressedRowBg : "transparent",
              })}
            >
              <Text
                style={{
                  color: sheetMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={{ gap: 10, paddingHorizontal: 20 }}>
          {LOG_STATUS_OPTIONS.map((statusOption) => {
            const selected = existing === statusOption;
            const labelColor = selected ? selectedFg : sheetFg;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={statusOption}
                onPress={() => prayer && onPick(prayer, statusOption)}
                style={({ pressed }) => ({
                  justifyContent: "center",
                  height: 54,
                  width: "100%",
                  borderWidth: selected ? 1.5 : 0,
                  borderColor: sheetPrimary,
                  borderRadius: 12,
                  paddingHorizontal: selected ? 14 : 2,
                  backgroundColor: pressed
                    ? pressedRowBg
                    : selected
                      ? selectedBg
                      : "transparent",
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 1,
                      borderColor: selected ? "#FFFFFF" : sheetSubtle,
                      backgroundColor: selected ? "#FFFFFF" : "transparent",
                    }}
                  >
                    {selected ? (
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 3.5,
                          backgroundColor: sheetPrimary,
                        }}
                      />
                    ) : null}
                  </View>
                  <Text
                    style={{
                      color: labelColor,
                      fontSize: 18,
                      fontWeight: selected ? "700" : "600",
                      includeFontPadding: false,
                      lineHeight: 22,
                      marginLeft: 12,
                      textAlignVertical: "center",
                    }}
                  >
                    {STATUS_LABEL[statusOption]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {existing ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 16,
              marginHorizontal: 20,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: sheetSubtle,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: sheetMuted,
                fontSize: 12,
                lineHeight: 17,
              }}
            >
              Current status: {STATUS_LABEL[existing]}
            </Text>
            <Pressable
              onPress={() => prayer && onClear(prayer)}
              style={({ pressed }) => ({
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 9,
                backgroundColor: pressed ? pressedRowBg : "transparent",
              })}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: sheetMuted,
                }}
              >
                Clear log
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

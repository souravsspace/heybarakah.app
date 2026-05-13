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
import {
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
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

function fmtRangeTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "p" : "a";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)}${period}`;
}

function formatWindowRange(start: Date | null, end: Date | null): string {
  if (!(start && end)) {
    return "Window pending";
  }
  return `${fmtRangeTime(start)} to ${fmtRangeTime(end)}`;
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
  const { height } = useWindowDimensions();
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
  const focusedPrayer = active ?? nextPrayer?.name ?? PRAYER_ORDER[0];
  const todayCardHeight = Math.max(430, height - insets.top - 352);

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

        {/* Today board: compact prayer log */}
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: 28,
            gap: 12,
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
                color: colors.primary,
                textTransform: "uppercase",
              }}
            >
              Log prayer
            </Text>
          </View>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              height: todayCardHeight,
              paddingHorizontal: 10,
              paddingVertical: 10,
              overflow: "hidden",
            }}
          >
            {PRAYER_ORDER.map((pname, i) => {
              const status = realWeek.getStatus(today, pname);
              const start = prayerDateFor(pname);
              const end = windowEndFor(pname);
              const isPast = start ? start.getTime() <= Date.now() : false;
              const isFocused = focusedPrayer === pname;
              return (
                <PrayerSlot
                  colors={colors}
                  index={i + 1}
                  isFirst={i === 0}
                  isFocused={isFocused}
                  isPast={isPast}
                  key={pname}
                  loading={loading}
                  onPress={() => {
                    if (activeUnlogged === pname) {
                      onMarkPrayed(pname).catch(() => undefined);
                      return;
                    }
                    if (isPast || status) {
                      setSheet(pname);
                    }
                  }}
                  prayer={pname}
                  progress={windowProgress(start, end)}
                  range={formatWindowRange(start, end)}
                  rowFlex={isFocused ? 1.18 : 1}
                  status={status}
                  time={todayPrayerTimes?.timings[pname]}
                />
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

function PrayerSlot({
  colors,
  index,
  prayer,
  time,
  isFocused,
  isPast,
  isFirst,
  status,
  loading,
  progress,
  range,
  rowFlex,
  onPress,
}: {
  colors: ThemeColors;
  index: number;
  prayer: PrayerName;
  time: string | undefined;
  isFocused: boolean;
  isPast: boolean;
  isFirst: boolean;
  status: PrayerStatus | undefined;
  loading: boolean;
  progress: number;
  range: string;
  rowFlex: number;
  onPress: () => void;
}) {
  const logged = !!status;
  const rowBg = isFocused ? colors.primarySoft : colors.card;
  const pressedBg = isFocused ? colors.primarySoft : colors.neutralSoft;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: rowFlex,
        minHeight: isFocused ? 102 : 76,
        paddingHorizontal: 16,
        paddingVertical: isFocused ? 18 : 16,
        borderRadius: 14,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: colors.divider,
        backgroundColor: pressed ? pressedBg : rowBg,
        justifyContent: "space-between",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <View style={{ flex: 1, gap: 9 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: isFocused ? colors.primary : colors.divider,
                backgroundColor: isFocused
                  ? colors.primary
                  : colors.surfaceSoft,
              }}
            >
              <Text
                style={{
                  color: isFocused ? colors.bg : colors.inkSubtle,
                  fontSize: 10,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {pad(index)}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  color:
                    status === "missed"
                      ? colors.inkSubtle
                      : isFocused
                        ? colors.primary
                        : colors.ink,
                  fontFamily: "Inter",
                  fontSize: 18,
                  fontWeight: isFocused || logged ? "700" : "600",
                  lineHeight: 23,
                }}
              >
                {PRAYER_LABEL[prayer]}
              </Text>
              <Text
                style={{
                  color: isFocused ? colors.inkMuted : colors.inkSubtle,
                  fontSize: 11,
                  fontStyle: status === "late" ? "italic" : "normal",
                  fontVariant: ["tabular-nums"],
                  fontWeight: "600",
                  letterSpacing: status === "qada" ? 1 : 0.2,
                  textTransform: status === "qada" ? "uppercase" : "none",
                }}
              >
                {range}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 8, minWidth: 70 }}>
          <Text
            style={{
              color: status === "missed" ? colors.inkSubtle : colors.ink,
              fontSize: 16,
              fontVariant: ["tabular-nums"],
              fontWeight: "700",
            }}
          >
            {time ? fmt12(time) : loading ? "…" : "—"}
          </Text>
          <StatusGlyph
            colors={colors}
            isPast={isPast}
            loading={loading}
            showLabel={isFocused}
            status={status}
          />
        </View>
      </View>
      {isFocused ? (
        <View
          style={{
            height: 2,
            marginLeft: 40,
            marginRight: 2,
            marginTop: 16,
            borderRadius: 999,
            backgroundColor: colors.surface,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.max(6, progress * 100)}%`,
              height: "100%",
              backgroundColor: colors.primary,
              opacity: status ? 0.45 : 1,
            }}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

function StatusGlyph({
  colors,
  status,
  isPast,
  loading,
  showLabel = false,
}: {
  colors: ThemeColors;
  status: PrayerStatus | undefined;
  isPast: boolean;
  loading: boolean;
  showLabel?: boolean;
}) {
  if (status === "on_time") {
    return (
      <StatusPill
        colors={colors}
        label={showLabel ? "On time" : "Done"}
        tone="success"
      />
    );
  }
  if (status) {
    return <StatusPill colors={colors} label={STATUS_LABEL[status]} />;
  }
  if (isPast) {
    return <StatusPill colors={colors} label="Log" tone="action" />;
  }
  return <StatusPill colors={colors} label={loading ? "…" : "Later"} />;
}

function StatusPill({
  colors,
  label,
  tone = "muted",
}: {
  colors: ThemeColors;
  label: string;
  tone?: "action" | "muted" | "success";
}) {
  const active = tone === "action" || tone === "success";
  return (
    <View
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.divider,
        backgroundColor: active ? colors.primarySoft : colors.surfaceSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          color: active ? colors.primary : colors.inkMuted,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.6,
          lineHeight: 12,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
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

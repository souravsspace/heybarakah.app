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
import { useTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import {
  useClearPrayer,
  useLogPrayer,
  useWeekLogs,
} from "@/hooks/usePrayerLogs";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

type PrayerName = LoggablePrayerName;
type Scheme = "light" | "dark";

interface Palette {
  accent: string;
  accentSoft: string;
  hairline: string;
  hairlineSoft: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  overlay: string;
  paper: string;
  paperRaised: string;
}

const LIGHT: Palette = {
  paper: "#F7F7F8",
  paperRaised: "#FDFDFE",
  ink: "#1B1D22",
  inkMuted: "#6E7177",
  inkSubtle: "#B0B2B6",
  hairline: "#E2E3E6",
  hairlineSoft: "#EDEEF0",
  accent: "#29603E",
  accentSoft: "#E8F0EA",
  overlay: "rgba(20,22,26,0.42)",
};

const DARK: Palette = {
  paper: "#0F1114",
  paperRaised: "#16181C",
  ink: "#F4F4F5",
  inkMuted: "#9CA0A6",
  inkSubtle: "#5E6168",
  hairline: "#262A30",
  hairlineSoft: "#1C1F24",
  accent: "#5FB07F",
  accentSoft: "#142519",
  overlay: "rgba(0,0,0,0.55)",
};

function paletteFor(scheme: Scheme): Palette {
  return scheme === "dark" ? DARK : LIGHT;
}

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
  const { scheme } = useTheme();
  const palette = useMemo(
    () => paletteFor(scheme === "dark" ? "dark" : "light"),
    [scheme]
  );
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

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting — single combined date line */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, gap: 8 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2,
              color: palette.inkMuted,
            }}
          >
            {dateLine}
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 26,
              lineHeight: 32,
              color: palette.ink,
            }}
          >
            Assalāmu ʿalaykum,{"\n"}
            {name}.
          </Text>
        </View>

        {/* Focal card — hairline border, paper bg, accent only on ghost pill */}
        <View
          style={{
            marginTop: 22,
            marginHorizontal: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: palette.hairline,
            backgroundColor: palette.paperRaised,
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
                  color: activeUnlogged ? palette.accent : palette.inkMuted,
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
                  color: palette.inkSubtle,
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
                  color: palette.ink,
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
                  color: palette.inkMuted,
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
                  color: palette.inkMuted,
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
                borderTopColor: palette.hairlineSoft,
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
                  color: palette.inkMuted,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                You are inside the window.
              </Text>
              <Pressable
                onPress={() => onMarkPrayed(activeUnlogged)}
                style={({ pressed }) => ({
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: palette.accent,
                  backgroundColor: pressed ? palette.accentSoft : "transparent",
                })}
              >
                <Text
                  style={{
                    color: palette.accent,
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

        {/* Today list — bordered card, window ranges, active progress */}
        <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 12 }}>
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
                color: palette.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Today
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                letterSpacing: 1.6,
                color: palette.inkSubtle,
                textTransform: "uppercase",
              }}
            >
              five anchors
            </Text>
          </View>

          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: palette.hairline,
              backgroundColor: palette.paperRaised,
              overflow: "hidden",
            }}
          >
            {PRAYER_ORDER.map((pname, i) => {
              const time = todayPrayerTimes?.timings[pname];
              const isActive = active === pname;
              const status = realWeek.getStatus(today, pname);
              const at = prayerDateFor(pname);
              const end = windowEndFor(pname);
              const isPast = at ? at.getTime() <= Date.now() : false;
              return (
                <PrayerRow
                  isActive={isActive}
                  isFirst={i === 0}
                  isPast={isPast}
                  key={pname}
                  loading={loading}
                  onPress={() => setSheet(pname)}
                  palette={palette}
                  prayer={pname}
                  status={status}
                  time={time}
                  windowEnd={end}
                  windowStart={at}
                />
              );
            })}
          </View>
        </View>
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />

      <LogSheet
        existing={sheet ? realWeek.getStatus(today, sheet) : undefined}
        onClear={onClear}
        onClose={() => setSheet(null)}
        onPick={onPickStatus}
        palette={palette}
        prayer={sheet}
      />
    </View>
  );
}

function PrayerRow({
  prayer,
  time,
  isActive,
  isPast,
  isFirst,
  status,
  palette,
  loading,
  windowEnd,
  windowStart,
  onPress,
}: {
  prayer: PrayerName;
  time: string | undefined;
  isActive: boolean;
  isPast: boolean;
  isFirst: boolean;
  status: PrayerStatus | undefined;
  palette: Palette;
  loading: boolean;
  windowEnd: Date | null;
  windowStart: Date | null;
  onPress: () => void;
}) {
  const interactive = isPast || !!status;
  const progress = windowProgress(windowStart, windowEnd);
  const range = formatWindowRange(windowStart, windowEnd);
  const isLogged = !!status;
  const nameWeight: "400" | "500" | "600" | "700" =
    isActive || status === "on_time"
      ? "700"
      : status === "missed"
        ? "400"
        : "500";
  const nameColor =
    status === "missed"
      ? palette.inkSubtle
      : status === "qada"
        ? palette.inkMuted
        : palette.ink;
  const rangeColor =
    status === "missed"
      ? palette.inkSubtle
      : isActive
        ? palette.accent
        : palette.inkMuted;
  const Container = interactive ? Pressable : View;
  return (
    <Container
      onPress={interactive ? onPress : undefined}
      style={({ pressed }: { pressed?: boolean } = {}) => ({
        minHeight: 72,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: palette.hairlineSoft,
        backgroundColor: isActive
          ? palette.accentSoft
          : pressed
            ? palette.hairlineSoft
            : "transparent",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <View style={{ flex: 1, gap: 5 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            {isActive ? (
              <Text
                style={{
                  color: palette.accent,
                  fontSize: 17,
                  fontWeight: "700",
                }}
              >
                ›
              </Text>
            ) : null}
            <Text
              style={{
                fontSize: 18,
                fontWeight: nameWeight,
                color: nameColor,
              }}
            >
              {PRAYER_LABEL[prayer]}
            </Text>
          </View>
          <Text
            style={{
              color: rangeColor,
              fontSize: 11,
              fontStyle: status === "late" ? "italic" : "normal",
              fontVariant: ["tabular-nums"],
              fontWeight: isActive ? "700" : "500",
              letterSpacing: status === "qada" ? 1.1 : 0.3,
              textTransform: status === "qada" ? "uppercase" : "none",
            }}
          >
            {range}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 5 }}>
          <Text
            style={{
              color: status === "missed" ? palette.inkSubtle : palette.ink,
              fontSize: 17,
              fontVariant: ["tabular-nums"],
              fontWeight: "700",
            }}
          >
            {time ? fmt12(time) : loading ? "…" : "—"}
          </Text>
          <RowTrailing
            isPast={isPast}
            loading={loading}
            palette={palette}
            status={status}
            time={time}
          />
        </View>
      </View>
      {isActive ? (
        <View
          style={{
            height: 1,
            marginTop: 12,
            backgroundColor: palette.hairline,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.max(8, progress * 100)}%`,
              height: 1,
              backgroundColor: palette.accent,
              opacity: isLogged ? 0.45 : 1,
            }}
          />
        </View>
      ) : null}
    </Container>
  );
}

function RowTrailing({
  status,
  isPast,
  time,
  loading,
  palette,
}: {
  status: PrayerStatus | undefined;
  isPast: boolean;
  time: string | undefined;
  loading: boolean;
  palette: Palette;
}) {
  if (status === "on_time") {
    return (
      <Text
        style={{
          color: palette.accent,
          fontSize: 16,
          fontWeight: "700",
          lineHeight: 18,
        }}
      >
        ✓
      </Text>
    );
  }
  if (status) {
    const glyph = status === "late" ? "~" : status === "qada" ? "◌" : "–";
    const color = status === "missed" ? palette.inkSubtle : palette.inkMuted;
    return (
      <Text
        style={{
          color,
          fontSize: status === "qada" ? 15 : 16,
          fontWeight: "700",
          lineHeight: 18,
        }}
      >
        {glyph}
      </Text>
    );
  }
  if (isPast) {
    return (
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: palette.accent,
          letterSpacing: 0.4,
        }}
      >
        Log
      </Text>
    );
  }
  return (
    <Text style={{ fontSize: 13, color: palette.inkSubtle }}>
      {time ? "·" : loading ? "…" : "·"}
    </Text>
  );
}

function LogSheet({
  prayer,
  existing,
  palette,
  onPick,
  onClear,
  onClose,
}: {
  prayer: PrayerName | null;
  existing: PrayerStatus | undefined;
  palette: Palette;
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
        style={{ flex: 1, backgroundColor: palette.overlay }}
      />
      <View
        style={{
          backgroundColor: palette.paperRaised,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: palette.hairline,
        }}
      >
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: palette.hairline,
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
              color: palette.inkMuted,
              textTransform: "uppercase",
            }}
          >
            Log prayer
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 22,
              color: palette.ink,
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
                  borderTopColor: palette.hairlineSoft,
                  backgroundColor: pressed
                    ? palette.hairlineSoft
                    : "transparent",
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
                      color: palette.inkSubtle,
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
                      color: selected ? palette.accent : palette.ink,
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
                      color: palette.accent,
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
              backgroundColor: pressed ? palette.hairlineSoft : "transparent",
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: palette.inkMuted,
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

import {
  classifyPrayerStatus,
  type LoggablePrayerName,
  type PrayerStatus,
} from "@barakah/core/prayer";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnlockMesh } from "@/components/meshes";
import { useTheme } from "@/contexts/theme-context";
import { useLogPrayer, useWeekLogs } from "@/hooks/usePrayerLogs";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { temporaryUnlock } from "@/lib/app-blocker";
import { activePrayerNow, dateKey } from "@/lib/date-utils";
import {
  LOCK_DURATION_MIN,
  lockBoundsMinutes,
} from "@/lib/prayer-window-config";
import { endAllLockActivities } from "@/lib/widgets-native";

type PrayerName = LoggablePrayerName;

const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export default function Unlock() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [prayerBusy, setPrayerBusy] = useState(false);
  const today = dateKey();
  const { todayPrayerTimes, location, prayerTimes } = usePrayerTimes();
  const week = useWeekLogs(today);
  const logPrayer = useLogPrayer();

  const activePrayer = useMemo(
    () => activePrayerNow(todayPrayerTimes),
    [todayPrayerTimes]
  );
  const activePrayerLogged = activePrayer
    ? week.getStatus(today, activePrayer)
    : undefined;
  const canMarkPrayed = Boolean(activePrayer && !activePrayerLogged);

  const tomorrowFajr = useMemo(() => {
    const idx = prayerTimes.findIndex((d) => d.date === today);
    return idx >= 0 ? (prayerTimes[idx + 1]?.timings.fajr ?? null) : null;
  }, [prayerTimes, today]);

  const classifyNow = useCallback(
    (prayer: PrayerName): PrayerStatus => {
      const timezone = location?.timezone ?? null;
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
    [location?.timezone, todayPrayerTimes, today, tomorrowFajr]
  );

  const close = useCallback(() => {
    if (router.canDismiss?.()) {
      router.dismiss();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(app)/(tabs)/locked");
  }, [router]);

  // Minutes left in the current prayer's lock window — how long to lift the
  // shield for so the next prayer re-shields normally.
  const remainingLockMin = useMemo(() => {
    if (!(activePrayer && todayPrayerTimes)) {
      return LOCK_DURATION_MIN;
    }
    const raw = (todayPrayerTimes.timings as Record<string, string>)[
      activePrayer
    ];
    const [h, m] = (raw ?? "").split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return LOCK_DURATION_MIN;
    }
    const { end } = lockBoundsMinutes(activePrayer, h * 60 + m);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return Math.max(1, end - nowMin);
  }, [activePrayer, todayPrayerTimes]);

  // Tear down everything tied to this prayer window: lockscreen / Dynamic Island
  // Live Activity, and the app shield (until the window ends).
  const liftShield = useCallback(async () => {
    await endAllLockActivities().catch(() => undefined);
    await temporaryUnlock(remainingLockMin).catch(() => undefined);
  }, [remainingLockMin]);

  // Already prayed this window: nothing to gate, so don't sit on the screen.
  useEffect(() => {
    if (activePrayerLogged) {
      close();
    }
  }, [activePrayerLogged, close]);

  const onContinueQuiet = async () => {
    await liftShield();
    close();
  };

  const onUnlockFiveMin = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined
    );
    try {
      await temporaryUnlock(5);
    } finally {
      setBusy(false);
      close();
    }
  };

  const onMarkPrayed = async () => {
    if (!(activePrayer && canMarkPrayed) || prayerBusy) {
      return;
    }
    setPrayerBusy(true);
    const status = classifyNow(activePrayer);
    try {
      await logPrayer({
        date: today,
        prayer: activePrayer,
        status,
        prayedAt: Date.now(),
      });
      await liftShield();
      // Swap the unlock modal for the celebration screen; it names the prayer,
      // then routes Home where the new log is already reflected live.
      router.replace({
        pathname: "/(app)/prayer-logged",
        params: { prayer: activePrayer, status },
      } as never);
    } finally {
      setPrayerBusy(false);
    }
  };

  return (
    <View style={{ backgroundColor: colors.bg, flex: 1 }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <UnlockMesh dark={scheme === "dark"} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top - 16, 4),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 8 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              letterSpacing: 0,
              lineHeight: 34,
            }}
          >
            Keep the quiet.
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              letterSpacing: 0,
              lineHeight: 34,
            }}
          >
            Return with intention.
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 14,
              lineHeight: 22,
              marginTop: 10,
              maxWidth: 340,
            }}
          >
            Your phone is at rest. Stay, or take a brief unlock.
          </Text>
        </View>

        <View
          style={{
            borderColor: colors.border,
            borderRadius: 24,
            borderWidth: 1,
            marginTop: 16,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor:
                scheme === "dark"
                  ? "rgba(20,20,20,0.38)"
                  : "rgba(41,96,62,0.82)",
              paddingHorizontal: 24,
              paddingVertical: 18,
            }}
          >
            <QuietGate colors={colors} dark={scheme === "dark"} />
            <Text
              style={{
                color: scheme === "dark" ? colors.ink : "#FFFFFF",
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 22,
                lineHeight: 28,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              A pause before Allah.
            </Text>
          </View>

          <View
            style={{
              backgroundColor:
                scheme === "dark"
                  ? "rgba(20,26,23,0.38)"
                  : "rgba(255,255,255,0.7)",
              paddingHorizontal: 6,
              paddingVertical: 6,
            }}
          >
            <TappableInfoRow
              busy={busy}
              colors={colors}
              icon="timer-outline"
              label="Temporary unlock"
              onPress={onUnlockFiveMin}
              value={busy ? "Unlocking…" : "5 minutes"}
            />
            <View
              style={{
                backgroundColor: colors.divider,
                height: 1,
                marginHorizontal: 12,
              }}
            />
            <View style={{ paddingHorizontal: 12, paddingVertical: 14 }}>
              <InfoRow
                colors={colors}
                icon="lock-closed-outline"
                label="Prayer-lock"
                value="continues after"
              />
            </View>
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 16 }} />

        <View style={{ width: "100%" }}>
          <Pressable
            accessibilityLabel={
              activePrayer
                ? `Mark ${PRAYER_LABEL[activePrayer]} as prayed`
                : "Mark current prayer as prayed"
            }
            accessibilityRole="button"
            disabled={!canMarkPrayed || prayerBusy}
            onPress={onMarkPrayed}
            style={({ pressed }) => ({
              opacity: prayerBusy ? 0.5 : pressed && canMarkPrayed ? 0.9 : 1,
              width: "100%",
            })}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: canMarkPrayed
                  ? scheme === "dark"
                    ? "#29603E"
                    : colors.primary
                  : "transparent",
                borderColor: canMarkPrayed
                  ? scheme === "dark"
                    ? "#29603E"
                    : colors.primary
                  : scheme === "dark"
                    ? "rgba(255,255,255,0.16)"
                    : colors.border,
                borderRadius: 18,
                borderWidth: 1.5,
                height: 60,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: canMarkPrayed ? "#FFFFFF" : colors.inkMuted,
                  fontSize: 16,
                  fontWeight: "700",
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                }}
              >
                {prayerBusy
                  ? "Updating…"
                  : activePrayerLogged
                    ? "Prayer logged"
                    : activePrayer
                      ? "I prayed"
                      : "No active prayer"}
              </Text>
            </View>
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable
            accessibilityRole="button"
            onPress={onContinueQuiet}
            style={({ pressed }) => ({
              opacity: pressed ? 0.65 : 1,
              width: "100%",
            })}
          >
            <View
              style={{
                alignItems: "center",
                height: 52,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: colors.inkMuted,
                  fontSize: 15,
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                Continue with quiet
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function QuietGate({
  colors,
  dark,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  dark: boolean;
}) {
  const line = dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.3)";
  const ink = dark ? colors.primary : "#FFFFFF";
  return (
    <View
      style={{
        alignItems: "center",
        height: 112,
        justifyContent: "center",
        width: 112,
      }}
    >
      <View
        style={{
          borderColor: line,
          borderRadius: 999,
          borderWidth: 1,
          height: 112,
          position: "absolute",
          width: 112,
        }}
      />
      <View
        style={{
          borderColor: line,
          borderRadius: 999,
          borderWidth: 1,
          height: 82,
          position: "absolute",
          width: 82,
        }}
      />
      <View
        style={{
          backgroundColor: dark ? colors.primarySoft : "rgba(255,255,255,0.14)",
          borderColor: dark ? colors.primary : "rgba(255,255,255,0.38)",
          borderRadius: 34,
          borderTopLeftRadius: 46,
          borderTopRightRadius: 46,
          borderWidth: 1,
          height: 76,
          justifyContent: "flex-end",
          overflow: "hidden",
          paddingBottom: 18,
          width: 58,
        }}
      >
        <View
          style={{
            alignSelf: "center",
            backgroundColor: ink,
            borderRadius: 999,
            height: 6,
            opacity: dark ? 1 : 0.9,
            width: 6,
          }}
        />
      </View>
    </View>
  );
}

function TappableInfoRow({
  busy,
  colors,
  icon,
  label,
  onPress,
  value,
}: {
  busy: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable
      accessibilityHint="Pauses the shield for 5 minutes"
      accessibilityLabel={`${label}, ${value}`}
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: busy ? 0.5 : pressed ? 0.7 : 1,
        width: "100%",
      })}
    >
      <View
        style={{
          alignItems: "center",
          borderRadius: 14,
          flexDirection: "row",
          paddingHorizontal: 12,
          paddingVertical: 14,
          width: "100%",
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.primarySoft,
            borderRadius: 999,
            height: 34,
            justifyContent: "center",
            marginRight: 10,
            width: 34,
          }}
        >
          <Ionicons color={colors.primary} name={icon} size={17} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.ink,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 12,
              fontWeight: "500",
              marginTop: 2,
            }}
          >
            {value}
          </Text>
        </View>
        <Ionicons color={colors.inkMuted} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

function InfoRow({
  colors,
  icon,
  label,
  value,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.primarySoft,
            borderRadius: 999,
            height: 34,
            justifyContent: "center",
            width: 34,
          }}
        >
          <Ionicons color={colors.primary} name={icon} size={17} />
        </View>
        <Text
          style={{
            color: colors.ink,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
      </View>

      <Text
        style={{
          color: colors.inkMuted,
          fontSize: 13,
          fontWeight: "500",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

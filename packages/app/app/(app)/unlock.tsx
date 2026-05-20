import {
  classifyPrayerStatus,
  type LoggablePrayerName,
  type PrayerDay,
  type PrayerStatus,
} from "@barakah/core/prayer";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnlockMesh } from "@/components/meshes";
import { useTheme } from "@/contexts/theme-context";
import { useLogPrayer, useWeekLogs } from "@/hooks/usePrayerLogs";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { temporaryUnlock } from "@/lib/app-blocker";

type PrayerName = LoggablePrayerName;

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

export default function Unlock() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [prayerBusy, setPrayerBusy] = useState(false);
  const today = todayKey();
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

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/locked");
    }
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
    try {
      await logPrayer({
        date: today,
        prayer: activePrayer,
        status: classifyNow(activePrayer),
        prayedAt: Date.now(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );
      close();
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
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top - 6, 8),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 8 }}>
            <View
              style={{ backgroundColor: colors.primary, height: 1, width: 28 }}
            />
            <Text
              style={{
                color: colors.inkMuted,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 2.4,
                textTransform: "uppercase",
              }}
            >
              Salah window
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Continue with quiet"
            accessibilityRole="button"
            onPress={close}
            style={({ pressed }) => ({
              alignItems: "center",
              borderColor: colors.border,
              borderRadius: 999,
              borderWidth: 1,
              height: 40,
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
              width: 40,
            })}
          >
            <Ionicons color={colors.inkMuted} name="close" size={20} />
          </Pressable>
        </View>

        <View style={{ paddingTop: 10 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 34,
              letterSpacing: 0,
              lineHeight: 41,
            }}
          >
            Keep the quiet.
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 34,
              letterSpacing: 0,
              lineHeight: 41,
            }}
          >
            Return with intention.
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 15,
              lineHeight: 24,
              marginTop: 16,
              maxWidth: 360,
            }}
          >
            Barakah is holding this prayer window so your phone can step aside.
            Stay here, or take a short unlock and come back.
          </Text>
        </View>

        <View
          style={{
            borderColor: colors.border,
            borderRadius: 24,
            borderWidth: 1,
            marginTop: 18,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor:
                scheme === "dark" ? colors.surface : colors.primary,
              minHeight: 190,
              paddingHorizontal: 24,
              paddingVertical: 20,
            }}
          >
            <QuietGate colors={colors} dark={scheme === "dark"} />
            <Text
              style={{
                color: scheme === "dark" ? colors.ink : "#FFFFFF",
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 24,
                lineHeight: 30,
                marginTop: 14,
                textAlign: "center",
              }}
            >
              A pause before Allah.
            </Text>
            <Text
              style={{
                color:
                  scheme === "dark"
                    ? colors.inkMuted
                    : "rgba(255,255,255,0.72)",
                fontSize: 13,
                lineHeight: 21,
                marginTop: 8,
                maxWidth: 260,
                textAlign: "center",
              }}
            >
              The lock lifts only when you choose it. The intention stays
              visible.
            </Text>
          </View>

          <View
            style={{
              backgroundColor:
                scheme === "dark" ? "rgba(20,26,23,0.72)" : colors.card,
              paddingHorizontal: 18,
              paddingVertical: 16,
            }}
          >
            <InfoRow
              colors={colors}
              icon="timer-outline"
              label="Temporary unlock"
              value="5 minutes"
            />
            <View
              style={{
                backgroundColor: colors.divider,
                height: 1,
                marginVertical: 12,
              }}
            />
            <InfoRow
              colors={colors}
              icon="lock-closed-outline"
              label="Prayer-lock"
              value="continues after"
            />
          </View>
        </View>

        <Text
          style={{
            color: colors.inkMuted,
            fontSize: 13,
            lineHeight: 21,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          A short unlock can help when something is urgent. Use it gently, then
          return to salah, in shāʾ Allāh.
        </Text>

        <View style={{ flex: 1, minHeight: 12 }} />

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
            alignItems: "center",
            backgroundColor: canMarkPrayed
              ? colors.primary
              : colors.neutralSoft,
            borderRadius: 16,
            opacity: prayerBusy ? 0.48 : pressed && canMarkPrayed ? 0.92 : 1,
            paddingVertical: 17,
          })}
        >
          <Text
            style={{
              color: canMarkPrayed ? "#FFFFFF" : colors.inkSubtle,
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: 0.96,
              textTransform: "uppercase",
            }}
          >
            {prayerBusy
              ? "Updating..."
              : activePrayerLogged
                ? "Prayer logged"
                : activePrayer
                  ? "I prayed"
                  : "No active prayer"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={close}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor:
              scheme === "dark" ? "rgba(20,26,23,0.72)" : colors.card,
            borderColor: colors.border,
            borderRadius: 16,
            borderWidth: 1,
            marginTop: 12,
            opacity: pressed ? 0.72 : 1,
            paddingVertical: 15,
          })}
        >
          <Text
            style={{
              color: colors.ink,
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            Continue with quiet
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onUnlockFiveMin}
          style={({ pressed }) => ({
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
            opacity: busy ? 0.4 : pressed ? 0.6 : 1,
            paddingVertical: 12,
          })}
        >
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {busy ? "Unlocking..." : "Unlock for 5 minutes"}
          </Text>
        </Pressable>
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

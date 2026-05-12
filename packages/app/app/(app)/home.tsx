import { api } from "@barakah/core/convex/_generated/api";
import type { PrayerDay } from "@barakah/core/prayer";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/user-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
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

  const { todayPrayerTimes, nextPrayer, location, loading } = usePrayerTimes();
  const active = useMemo(
    () => activePrayerNow(todayPrayerTimes),
    [todayPrayerTimes]
  );
  const countdown = useCountdown(nextPrayer?.at ?? null);
  const hijri = todayPrayerTimes?.hijriDate ?? null;

  const today = todayKey();
  const dateLabel = new Date(today).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-md" style={{ paddingTop: 8, gap: 4 }}>
          <Text
            className="font-sans"
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            {dateLabel}
          </Text>
          <Text
            className="font-serif text-ink"
            style={{ fontSize: 28, lineHeight: 34 }}
          >
            Assalāmu ʿalaykum,{"\n"}
            {name}.
          </Text>
          {hijri ? (
            <Text
              className="font-sans"
              style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}
            >
              {hijri}
            </Text>
          ) : null}
        </View>

        <View
          className="mx-md"
          style={{
            marginTop: 24,
            borderRadius: 24,
            backgroundColor: "#29603E",
            overflow: "hidden",
          }}
        >
          <View style={{ padding: 24, gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Next prayer
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.14)",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {location?.city ?? "Locating…"}
                </Text>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text
                className="font-serif"
                style={{
                  color: "#FFFFFF",
                  fontSize: 44,
                  lineHeight: 48,
                }}
              >
                {nextPrayer ? PRAYER_LABEL[nextPrayer.name] : "—"}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 16,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {nextPrayer ? fmt12(nextPrayer.time) : "Loading…"}
              </Text>
            </View>

            {countdown ? (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingTop: 4,
                }}
              >
                <CountdownBlock label="hr" value={pad(countdown.h)} />
                <CountdownBlock label="min" value={pad(countdown.m)} />
                <CountdownBlock label="sec" value={pad(countdown.s)} />
              </View>
            ) : null}
          </View>
        </View>

        <View className="px-md" style={{ marginTop: 28, gap: 12 }}>
          <Text
            className="font-sans"
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Today
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            {PRAYER_ORDER.map((name, i) => {
              const time = todayPrayerTimes?.timings[name];
              const isActive = active === name;
              const isNext = nextPrayer?.name === name;
              return (
                <View
                  key={name}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: "#EFEFEF",
                    backgroundColor: isActive ? "#E8F0EA" : "transparent",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isActive
                          ? "#29603E"
                          : isNext
                            ? "#29603E"
                            : "#D1D5DB",
                        opacity: isNext && !isActive ? 0.5 : 1,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: isActive ? "700" : "500",
                        color: "#000",
                      }}
                    >
                      {PRAYER_LABEL[name]}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "#29603E" : "#000",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {time ? fmt12(time) : loading ? "…" : "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="px-md" style={{ marginTop: 28, gap: 12 }}>
          <Text
            className="font-sans"
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Lock status
          </Text>
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 20,
              gap: 8,
            }}
          >
            <Text
              className="font-serif"
              style={{ fontSize: 20, color: "#000" }}
            >
              Phone unlocks at {nextPrayer ? fmt12(nextPrayer.time) : "—"}
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 14, lineHeight: 20 }}>
              Five times a day, social apps stay quiet so you can pray with
              presence, in shāʾ Allāh.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CountdownBlock({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        minWidth: 64,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

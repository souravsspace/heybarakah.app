import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { getCurrentLocation } from "@/hooks/use-permissions";

const SCREEN_PAD_X = 24;

const PRAYERS = [
  {
    name: "Fajr",
    time: "5:12",
    minutes: 5 * 60 + 12,
    icon: "moon-outline" as const,
  },
  {
    name: "Dhuhr",
    time: "12:48",
    minutes: 12 * 60 + 48,
    icon: "sunny-outline" as const,
  },
  {
    name: "Asr",
    time: "16:22",
    minutes: 16 * 60 + 22,
    icon: "partly-sunny-outline" as const,
  },
  {
    name: "Maghrib",
    time: "19:08",
    minutes: 19 * 60 + 8,
    icon: "cloudy-night-outline" as const,
  },
  { name: "Isha", time: "20:34", minutes: 20 * 60 + 34, icon: "moon" as const },
];

function formatToday() {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function nextPrayerIndex() {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const idx = PRAYERS.findIndex((p) => p.minutes > cur);
  return idx === -1 ? 0 : idx;
}

function DayRibbon({ width, nextIdx }: { width: number; nextIdx: number }) {
  const start = PRAYERS[0].minutes;
  const end = PRAYERS.at(-1)?.minutes ?? 0;
  const range = end - start;

  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const clamped = Math.max(start, Math.min(end, cur));
  const nowPct = ((clamped - start) / range) * 100;

  const trackHeight = 1;
  const tickHeight = 10;
  const INSET = 20;
  const innerWidth = width - INSET * 2;

  return (
    <View style={{ width, paddingBottom: 4 }}>
      <View
        style={{
          height: 28,
          justifyContent: "center",
          marginHorizontal: INSET,
        }}
      >
        <View
          style={{
            height: trackHeight,
            backgroundColor: "#E5E7EB",
            width: "100%",
          }}
        />
        {PRAYERS.map((p, i) => {
          const pct = ((p.minutes - start) / range) * 100;
          const active = i === nextIdx;
          return (
            <View
              key={p.name}
              style={{
                position: "absolute",
                left: (pct / 100) * innerWidth - 0.5,
                width: 1,
                height: tickHeight,
                backgroundColor: active ? "#29603E" : "#9CA3AF",
                top: 14 - tickHeight / 2,
              }}
            />
          );
        })}
        <View
          style={{
            position: "absolute",
            left: (nowPct / 100) * innerWidth - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#29603E",
            top: 14 - 4,
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        />
      </View>
      <View
        style={{
          marginTop: 2,
          marginHorizontal: INSET,
          height: 14,
        }}
      >
        {PRAYERS.map((p, i) => {
          const pct = ((p.minutes - start) / range) * 100;
          const active = i === nextIdx;
          return (
            <Text
              className="font-sans"
              key={p.name}
              style={{
                position: "absolute",
                left: (pct / 100) * innerWidth - 16,
                width: 32,
                textAlign: "center",
                fontSize: 9,
                letterSpacing: 1,
                fontWeight: "700",
                color: active ? "#29603E" : "#9CA3AF",
              }}
            >
              {p.time}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export default function PrayerTimes() {
  const { state } = useOnboardingState();
  const { next } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const fullWidth = width - SCREEN_PAD_X * 2;
  const [city, setCity] = useState("Mecca, Saudi Arabia");
  const nextIdx = useMemo(() => nextPrayerIndex(), []);
  const today = useMemo(() => formatToday(), []);

  useEffect(() => {
    if (!state.locationGranted) {
      return;
    }
    getCurrentLocation().then((loc) => {
      if (loc) {
        setCity("Your location");
      }
    });
  }, [state.locationGranted]);

  const method = state.calcMethod ? state.calcMethod.toUpperCase() : "ISNA";

  return (
    <ScreenShell footer={<Button label="Looks good" onPress={next} />}>
      <FadeSlideIn className="flex-1 items-center gap-md" delay={120}>
        <View className="items-center" style={{ width: fullWidth }}>
          <Eyebrow label={today} />
          <Headline align="center" size="h1">
            {"Your salah,\nset for today."}
          </Headline>
          <View className="mt-xs flex-row items-center gap-sm">
            <MetaItem icon="location-outline" label={city} />
            <Dot />
            <MetaItem icon="compass-outline" label={method} />
          </View>
        </View>

        <FadeSlideIn delay={260}>
          <View
            className="rounded-2xl border border-neutral bg-surface"
            style={{
              width: fullWidth,
              paddingHorizontal: 18,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            {PRAYERS.map((p, i) => (
              <PrayerRow
                icon={p.icon}
                isLast={i === PRAYERS.length - 1}
                isNext={i === nextIdx}
                key={p.name}
                name={p.name}
                time={p.time}
              />
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn className="mt-auto items-center" delay={380}>
          <DayRibbon nextIdx={nextIdx} width={fullWidth} />
        </FadeSlideIn>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function Eyebrow({ label }: { label: string }) {
  return (
    <View className="items-center" style={{ marginBottom: 10 }}>
      <Text
        className="font-sans text-tertiary"
        style={{ fontSize: 10, letterSpacing: 2, fontWeight: "700" }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function MetaItem({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <Ionicons color="#6B7280" name={icon} size={12} />
      <Text className="font-sans text-tertiary" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

function Dot() {
  return (
    <View
      className="bg-neutral"
      style={{ width: 3, height: 3, borderRadius: 2 }}
    />
  );
}

function PrayerRow({
  icon,
  name,
  time,
  isNext,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  time: string;
  isNext: boolean;
  isLast: boolean;
}) {
  const ink = isNext ? "#29603E" : "#000000";
  const muted = isNext ? "#29603E" : "#6B7280";

  return (
    <View>
      <View
        className="flex-row items-center"
        style={{ paddingVertical: 16, gap: 14 }}
      >
        <View
          className="items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isNext
              ? "rgba(41,96,62,0.07)"
              : "rgba(0,0,0,0.04)",
          }}
        >
          <Ionicons color={muted} name={icon} size={18} />
        </View>

        <View className="flex-1 flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Text
              className="font-sans"
              style={{
                color: ink,
                fontSize: 15,
                fontWeight: "600",
                letterSpacing: -0.1,
              }}
            >
              {name}
            </Text>
            {isNext ? (
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: "rgba(41,96,62,0.1)",
                }}
              >
                <Text
                  className="font-sans"
                  style={{
                    color: "#29603E",
                    fontSize: 9,
                    letterSpacing: 1.2,
                    fontWeight: "700",
                  }}
                >
                  NEXT
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            className="font-serif"
            style={{ color: ink, fontSize: 20, lineHeight: 24 }}
          >
            {time}
          </Text>
        </View>
      </View>
      {isLast ? null : (
        <View style={{ height: 1, backgroundColor: "#EFEFEF" }} />
      )}
    </View>
  );
}

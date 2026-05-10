import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { usePrayerTimes as useLivePrayerTimes } from "@/hooks/usePrayerTimes";

const SCREEN_PAD_X = 24;

const FALLBACK_PRAYERS = [
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

interface PrayerRowData {
  icon: keyof typeof Ionicons.glyphMap;
  minutes: number;
  name: string;
  time: string;
}

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
  const idx = FALLBACK_PRAYERS.findIndex((p) => p.minutes > cur);
  return idx === -1 ? 0 : idx;
}

function nextPrayerIndexFor(prayers: PrayerRowData[]) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const idx = prayers.findIndex((p) => p.minutes > cur);
  return idx === -1 ? 0 : idx;
}

function parseMinutes(value: string) {
  const [hoursText, minutesText] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

function toPrayerRows(
  todayPrayerTimes: {
    timings: {
      fajr: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
    };
  } | null
): PrayerRowData[] | null {
  if (!todayPrayerTimes) {
    return null;
  }

  const entries: [
    name: string,
    time: string,
    icon: keyof typeof Ionicons.glyphMap,
  ][] = [
    ["Fajr", todayPrayerTimes.timings.fajr, "moon-outline"],
    ["Dhuhr", todayPrayerTimes.timings.dhuhr, "sunny-outline"],
    ["Asr", todayPrayerTimes.timings.asr, "partly-sunny-outline"],
    ["Maghrib", todayPrayerTimes.timings.maghrib, "cloudy-night-outline"],
    ["Isha", todayPrayerTimes.timings.isha, "moon"],
  ];

  const rows = entries
    .map(([name, time, icon]) => {
      const minutes = parseMinutes(time);
      if (minutes === null) {
        return null;
      }
      return { name, time, minutes, icon };
    })
    .filter((value) => value !== null);

  return rows.length === entries.length ? rows : null;
}

function DayRibbon({
  prayers,
  width,
  nextIdx,
}: {
  prayers: PrayerRowData[];
  width: number;
  nextIdx: number;
}) {
  const start = prayers[0]?.minutes ?? 0;
  const end = prayers.at(-1)?.minutes ?? 0;
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
        {prayers.map((p, i) => {
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
        {prayers.map((p, i) => {
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

  const liveData = useLivePrayerTimes();
  const liveRows = useMemo(
    () => toPrayerRows(liveData.todayPrayerTimes),
    [liveData.todayPrayerTimes]
  );

  const prayers = liveRows ?? FALLBACK_PRAYERS;
  const nextIdx = useMemo(
    () => (liveRows ? nextPrayerIndexFor(prayers) : nextPrayerIndex()),
    [liveRows, prayers]
  );
  const today = useMemo(() => formatToday(), []);

  const city = liveData.location?.city ?? "Mecca, Saudi Arabia";
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
            {prayers.map((p, i) => (
              <PrayerRow
                icon={p.icon}
                isLast={i === prayers.length - 1}
                isNext={i === nextIdx}
                key={p.name}
                name={p.name}
                time={p.time}
              />
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn className="mt-auto items-center" delay={380}>
          <DayRibbon nextIdx={nextIdx} prayers={prayers} width={fullWidth} />
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

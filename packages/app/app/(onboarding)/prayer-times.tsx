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

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const PRAYER_ICONS: Record<
  (typeof PRAYER_NAMES)[number],
  keyof typeof Ionicons.glyphMap
> = {
  Fajr: "moon-outline",
  Dhuhr: "sunny-outline",
  Asr: "partly-sunny-outline",
  Maghrib: "cloudy-night-outline",
  Isha: "moon",
};

const METHOD_LABELS: Record<string, string> = {
  1: "KARACHI",
  2: "ISNA",
  3: "MWL",
  4: "UMM AL-QURA",
  5: "EGYPTIAN",
  7: "MWL",
  8: "UMM AL-QURA",
  9: "KARACHI",
  99: "CUSTOM",
};

interface PrayerRowData {
  icon: keyof typeof Ionicons.glyphMap;
  minutes: number;
  name: string;
  time: string;
}

interface PrayerTimesData {
  city: string;
  method: string;
  prayers: PrayerRowData[];
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
  const clean = value.replace(/[^\d:]/g, "");
  const [hRaw, mRaw] = clean.split(":");
  const hours = Number(hRaw);
  const mins = Number(mRaw);
  if (Number.isNaN(hours) || Number.isNaN(mins)) {
    return null;
  }
  return hours * 60 + mins;
}

function toPrayerRows(timings: Record<string, string>) {
  const mapped = PRAYER_NAMES.map((name) => {
    const time = timings[name];
    const minutes = parseMinutes(time);
    if (!time || minutes === null) {
      return null;
    }

    return {
      name,
      time: time.replace(/\s*\(.+\)\s*/g, ""),
      minutes,
      icon: PRAYER_ICONS[name],
    } satisfies PrayerRowData;
  }).filter((item) => item !== null);

  if (mapped.length !== PRAYER_NAMES.length) {
    return null;
  }

  return mapped;
}

function methodCodeFromCalcMethod(calcMethod?: string) {
  switch (calcMethod) {
    case "karachi":
      return 1;
    case "isna":
      return 2;
    case "mwl":
      return 3;
    case "umm-al-qura":
      return 4;
    case "egyptian":
      return 5;
    default:
      return 2;
  }
}

function usePrayerTimes({
  calcMethod,
  locationGranted,
}: {
  calcMethod?: string;
  locationGranted: boolean;
}) {
  const [data, setData] = useState<PrayerTimesData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let latitude: number | null = null;
        let longitude: number | null = null;

        if (locationGranted) {
          const loc = await getCurrentLocation();
          if (loc) {
            latitude = loc.coords.latitude;
            longitude = loc.coords.longitude;
          }
        }

        const methodCode = methodCodeFromCalcMethod(calcMethod);
        const endpoint =
          latitude !== null && longitude !== null
            ? `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${methodCode}`
            : `https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi Arabia&method=${methodCode}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          return;
        }

        const payload: unknown = await response.json();
        if (
          !payload ||
          typeof payload !== "object" ||
          !("data" in payload) ||
          !payload.data ||
          typeof payload.data !== "object"
        ) {
          return;
        }

        const dataObj = payload.data as {
          timings?: Record<string, string>;
          meta?: {
            timezone?: string;
            method?: { id?: number; name?: string };
          };
        };

        if (!dataObj.timings) {
          return;
        }

        const prayers = toPrayerRows(dataObj.timings);
        if (!prayers) {
          return;
        }

        const city =
          latitude !== null && longitude !== null
            ? "Your location"
            : "Mecca, Saudi Arabia";
        const methodFromApi = dataObj.meta?.method?.id
          ? METHOD_LABELS[String(dataObj.meta.method.id)]
          : undefined;
        const method =
          methodFromApi ?? dataObj.meta?.method?.name?.toUpperCase() ?? "ISNA";

        if (!cancelled) {
          setData({ city, method, prayers });
        }
      } catch {
        // Keep fallback static data to avoid blocking onboarding.
      }
    };

    load().catch(() => {
      // Keep fallback static data to avoid blocking onboarding.
    });

    return () => {
      cancelled = true;
    };
  }, [calcMethod, locationGranted]);

  return data;
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

  const liveData = usePrayerTimes({
    calcMethod: state.calcMethod,
    locationGranted: Boolean(state.locationGranted),
  });

  const prayers = liveData?.prayers ?? FALLBACK_PRAYERS;
  const nextIdx = useMemo(
    () => (liveData ? nextPrayerIndexFor(prayers) : nextPrayerIndex()),
    [liveData, prayers]
  );
  const today = useMemo(() => formatToday(), []);

  const city = liveData?.city ?? "Mecca, Saudi Arabia";
  const method =
    liveData?.method ??
    (state.calcMethod ? state.calcMethod.toUpperCase() : "ISNA");

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

import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { Hourglass } from "@/components/onboarding/illustrations/hourglass";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const TOTAL_MS = 4200;

const STAGES = [
  "Reading your location",
  "Aligning fiqh and madhab",
  "Computing sunrise and sunset",
  "Mapping prayer windows",
  "Locking your plan",
];

const PRIMARY = "#29603E";
const RING_OUTER = "#E8E5DF";
const RING_INNER = "#EFECE5";
const DOT_REST = "#E2DED4";

export default function Calculating() {
  const { next } = useOnboardingNav();
  const [active, setActive] = useState(0);
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    const step = TOTAL_MS / STAGES.length;
    const interval = setInterval(() => {
      setActive((i) => Math.min(i + 1, STAGES.length - 1));
    }, step);
    const t = setTimeout(() => nextRef.current(), TOTAL_MS);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  return (
    <ScreenShell scroll={false} showBack={false}>
      <View
        className="flex-1 items-center justify-between"
        style={{ paddingTop: 32, paddingBottom: 24 }}
      >
        <FadeSlideIn className="items-center">
          <Text
            className="font-sans text-tertiary"
            style={{ fontSize: 10, fontWeight: "700", letterSpacing: 2.4 }}
          >
            ONE MOMENT
          </Text>
          <View style={{ marginTop: 14 }}>
            <Headline align="center" size="h1">
              {"Building\nyour plan."}
            </Headline>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={140}>
          <View
            className="items-center justify-center"
            style={{ height: 240, width: 240 }}
          >
            <View
              style={{
                borderColor: RING_OUTER,
                borderRadius: 120,
                borderWidth: 1,
                height: 240,
                position: "absolute",
                width: 240,
              }}
            />
            <View
              style={{
                borderColor: RING_INNER,
                borderRadius: 90,
                borderWidth: 1,
                height: 180,
                position: "absolute",
                width: 180,
              }}
            />
            <Hourglass color={PRIMARY} size={112} />
          </View>
        </FadeSlideIn>

        <View className="items-center" style={{ minHeight: 84 }}>
          <View style={{ height: 28, justifyContent: "center" }}>
            <FadeSlideIn key={STAGES[active]}>
              <Text
                className="text-center font-serif text-ink"
                style={{ fontSize: 17, letterSpacing: -0.2, lineHeight: 24 }}
              >
                {STAGES[active]}
              </Text>
            </FadeSlideIn>
          </View>
          <View
            className="flex-row items-center"
            style={{ gap: 6, marginTop: 18 }}
          >
            {STAGES.map((label, i) => {
              const reached = i <= active;
              const isActive = i === active;
              return (
                <View
                  key={label}
                  style={{
                    backgroundColor: reached ? PRIMARY : DOT_REST,
                    borderRadius: 2,
                    height: 4,
                    width: isActive ? 22 : 6,
                  }}
                />
              );
            })}
          </View>
          <Text
            className="font-sans text-tertiary"
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 1.6,
              marginTop: 14,
            }}
          >
            {active + 1} / {STAGES.length}
          </Text>
        </View>
      </View>
    </ScreenShell>
  );
}

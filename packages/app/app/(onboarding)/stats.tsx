import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { CountUp } from "@/components/onboarding/count-up";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const BAR_COLOR = "#EAB5A8";
const NEUTRAL = "#E5E7EB";
const SCREEN_PAD_X = 24;
const BAR_WIDTH = 64;
const MAX_BAR_HEIGHT = 140;

const CITIES = [
  { name: "Mecca", min: 4500, max: 6000 },
  { name: "London", min: 1800, max: 2800 },
  { name: "Jakarta", min: 3200, max: 4400 },
  { name: "New York", min: 1400, max: 2200 },
] as const;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Stats() {
  const { next } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const chartWidth = width - SCREEN_PAD_X * 2;

  const data = useMemo(
    () => CITIES.map((c) => ({ name: c.name, value: randInt(c.min, c.max) })),
    [],
  );
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const max = Math.max(...data.map((d) => d.value));

  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Continue" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1" delay={120}>
        <FadeSlideIn delay={140}>
          <View style={{ width: 28, height: 1, backgroundColor: ACCENT }} />
          <Text
            className="font-sans text-tertiary"
            style={{
              fontSize: 10,
              letterSpacing: 2.4,
              fontWeight: "700",
              marginTop: 12,
            }}
          >
            WORLDWIDE
          </Text>
        </FadeSlideIn>

        <FadeSlideIn delay={260}>
          <CountUp
            className="font-serif text-ink"
            duration={1400}
            style={{
              fontSize: 60,
              lineHeight: 64,
              fontWeight: "700",
              marginTop: 28,
              letterSpacing: -1,
            }}
            to={total}
          />
          <Text
            className="font-sans text-body-md text-tertiary"
            style={{ marginTop: 10, lineHeight: 24, maxWidth: 320 }}
          >
            Muslims praying with Barakah, this moment.
          </Text>
        </FadeSlideIn>

        <FadeSlideIn className="flex-1 justify-center" delay={520}>
          <BarChart data={data} max={max} width={chartWidth} />
        </FadeSlideIn>

        <FadeSlideIn className="items-center" delay={900}>
          <Text
            className="font-serif text-tertiary"
            style={{ fontSize: 16, fontStyle: "italic", lineHeight: 22 }}
          >
            and growing every day.
          </Text>
        </FadeSlideIn>
      </FadeSlideIn>
    </ScreenShell>
  );
}

interface Datum {
  name: string;
  value: number;
}

function BarChart({
  data,
  max,
  width,
}: {
  data: Datum[];
  max: number;
  width: number;
}) {
  const colWidth = width / data.length;

  return (
    <View style={{ width }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {data.map((d, i) => (
          <FadeSlideIn delay={i * 90} key={d.name}>
            <View style={{ width: colWidth, alignItems: "center" }}>
              <Text
                className="font-sans text-tertiary"
                style={{
                  fontSize: 10,
                  letterSpacing: 1.2,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                {d.value.toLocaleString()}
              </Text>
              <View
                style={{
                  width: BAR_WIDTH,
                  height: Math.round((d.value / max) * MAX_BAR_HEIGHT),
                  backgroundColor: BAR_COLOR,
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 14,
                }}
              />
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: NEUTRAL,
          width: "100%",
          marginTop: 0,
        }}
      />

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        {data.map((d) => (
          <View key={d.name} style={{ width: colWidth, alignItems: "center" }}>
            <Text
              className="font-sans text-tertiary"
              style={{ fontSize: 10, letterSpacing: 1.6, fontWeight: "600" }}
            >
              {d.name.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

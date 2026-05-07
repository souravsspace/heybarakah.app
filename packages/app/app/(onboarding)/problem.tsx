import { Text, useWindowDimensions, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { AreaChart } from "@/components/onboarding/illustrations/area-chart";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const SCREEN_PAD_X = 24;
const CARD_PAD_X = 16;

export default function Problem() {
  const { next } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const fullWidth = width - SCREEN_PAD_X * 2;
  const chartWidth = fullWidth - CARD_PAD_X * 2;

  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Continue" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1 items-center gap-md" delay={120}>
        <View className="items-center gap-xs">
          <Headline>Your phone steals five prayers a day.</Headline>
          <BodyText size="sm" tone="muted">
            96 pickups daily — most land inside salah windows.
          </BodyText>
        </View>

        <FadeSlideIn delay={260}>
          <View
            className="rounded-2xl border border-neutral bg-surface px-md pt-md pb-sm"
            style={{ width: fullWidth }}
          >
            <View className="mb-xs flex-row items-center justify-between">
              <Text
                className="font-sans text-caption text-tertiary"
                style={{ letterSpacing: 0.8 }}
              >
                PICKUPS BY PRAYER WINDOW
              </Text>
              <View className="flex-row items-center gap-[6px]">
                <View className="h-[6px] w-[6px] rounded-full bg-primary" />
                <Text className="font-sans text-caption text-tertiary">
                  Weekday avg
                </Text>
              </View>
            </View>
            <AreaChart
              height={200}
              labels={["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]}
              peakIndex={3}
              peakLabel="96 / day"
              values={[0.22, 0.48, 0.6, 0.95, 0.68]}
              width={chartWidth}
            />
          </View>
        </FadeSlideIn>

        <FadeSlideIn className="mt-auto items-center" delay={380}>
          <View
            className="items-center"
            style={{ width: fullWidth, paddingBottom: 4 }}
          >
            <View
              style={{
                width: 28,
                height: 1,
                backgroundColor: "#29603E",
                marginBottom: 14,
              }}
            />
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 10,
                letterSpacing: 2,
                fontWeight: "700",
              }}
            >
              AT THIS RATE
            </Text>
            <Text
              className="text-center font-serif text-ink"
              style={{
                fontSize: 22,
                lineHeight: 28,
                marginTop: 10,
              }}
            >
              A full day a year,{"\n"}stolen from your salah.
            </Text>
          </View>
        </FadeSlideIn>
      </FadeSlideIn>
    </ScreenShell>
  );
}

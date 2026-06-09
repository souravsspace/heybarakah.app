import { Text, useWindowDimensions, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { MosqueTwin } from "@/components/onboarding/illustrations/mosque-twin";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const SCREEN_PAD_X = 24;

const STEPS = [
  { label: "Adhan begins", detail: "Phone enters salah lock instantly." },
  { label: "During salah", detail: "Notifications silenced. Apps held." },
  { label: "After salam", detail: "Phone returns with a dhikr nudge." },
];

export default function Promise() {
  const { next } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const fullWidth = width - SCREEN_PAD_X * 2;

  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Show me how" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1 items-center gap-md" delay={120}>
        <View className="items-center gap-[2px]">
          <Headline size="h1">{"Locks you out\nduring salah."}</Headline>
          <BodyText size="sm" tone="muted">
            Five firm pauses a day — silent, automatic, merciful.
          </BodyText>
        </View>

        <FadeSlideIn delay={260}>
          <View
            className="rounded-2xl border border-neutral bg-surface"
            style={{
              width: fullWidth,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 16,
            }}
          >
            <View className="items-center">
              <MosqueTwin size={188} />
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#E5E7EB",
                marginTop: 10,
                marginBottom: 14,
              }}
            />

            <View className="mb-sm flex-row items-center justify-between">
              <Text
                className="font-sans text-caption text-tertiary"
                style={{ letterSpacing: 0.8 }}
              >
                HOW IT WORKS
              </Text>
              <View className="flex-row items-center gap-[6px]">
                <View className="h-[6px] w-[6px] rounded-full bg-primary" />
                <Text className="font-sans text-caption text-tertiary">
                  Auto, all five
                </Text>
              </View>
            </View>

            {STEPS.map((step, i) => (
              <Step
                detail={step.detail}
                index={i + 1}
                isLast={i === STEPS.length - 1}
                key={step.label}
                label={step.label}
              />
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn className="mt-auto items-center" delay={380}>
          <View className="items-center" style={{ width: fullWidth }}>
            <View
              style={{
                width: 28,
                height: 1,
                backgroundColor: "#29603E",
                marginBottom: 12,
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
              THE PROMISE
            </Text>
            <Text
              className="text-center font-serif text-ink"
              style={{ fontSize: 18, lineHeight: 24, marginTop: 8 }}
            >
              You stay in control.
            </Text>
            <View className="mt-xs flex-row items-center gap-sm">
              <Reassure label="Emergency calls pass" />
              <Dot />
              <Reassure label="Disable any time" />
            </View>
          </View>
        </FadeSlideIn>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function Step({
  index,
  label,
  detail,
  isLast,
}: {
  index: number;
  label: string;
  detail: string;
  isLast: boolean;
}) {
  return (
    <View className="flex-row items-start gap-sm">
      <View className="items-center" style={{ width: 24 }}>
        <View
          className="items-center justify-center rounded-full border border-primary"
          style={{ width: 24, height: 24 }}
        >
          <Text
            className="font-serif text-primary"
            style={{ fontSize: 12, fontWeight: "700" }}
          >
            {index}
          </Text>
        </View>
        {isLast ? null : (
          <View
            className="bg-neutral"
            style={{ width: 1, flex: 1, marginTop: 4, minHeight: 24 }}
          />
        )}
      </View>
      <View className="flex-1" style={{ paddingBottom: isLast ? 0 : 18 }}>
        <Text
          className="font-serif text-ink"
          style={{ fontSize: 15, fontWeight: "700", lineHeight: 20 }}
        >
          {label}
        </Text>
        <Text
          className="font-sans text-caption text-tertiary"
          style={{ marginTop: 1 }}
        >
          {detail}
        </Text>
      </View>
    </View>
  );
}

function Reassure({ label }: { label: string }) {
  return <Text className="font-sans text-caption text-tertiary">{label}</Text>;
}

function Dot() {
  return (
    <View
      className="bg-neutral"
      style={{ width: 3, height: 3, borderRadius: 2 }}
    />
  );
}

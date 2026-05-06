import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const STEPS = [
  {
    icon: "lock-open-outline" as const,
    title: "Today",
    body: "Full access. Lock your first prayer.",
  },
  {
    icon: "mail-outline" as const,
    title: "Day 5",
    body: "Quiet reminder. Cancel anytime, no charge.",
  },
  {
    icon: "wallet-outline" as const,
    title: "Day 7",
    body: "Subscription begins. Continue uninterrupted.",
  },
];

export default function Timeline() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell footer={<Button label="Continue" onPress={next} />}>
      <FadeSlideIn className="gap-md">
        <View className="gap-sm items-center">
          <Headline size="h2">No surprises.</Headline>
          <BodyText tone="muted">Here is exactly what happens next.</BodyText>
        </View>
        <View className="mt-md gap-md">
          {STEPS.map((s, i) => (
            <View key={s.title} className="flex-row gap-md">
              <View className="items-center">
                <View className="w-[36px] h-[36px] rounded-full border border-primary items-center justify-center bg-surface">
                  <Ionicons name={s.icon} size={18} color="#29603E" />
                </View>
                {i < STEPS.length - 1 ? (
                  <View className="w-px flex-1 bg-neutral mt-[4px]" style={{ minHeight: 28 }} />
                ) : null}
              </View>
              <View className="flex-1 pb-md">
                <Text className="font-sans text-label text-ink">{s.title}</Text>
                <Text className="font-sans text-body-sm text-tertiary mt-[2px]">{s.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

import { Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { CountUp } from "@/components/onboarding/count-up";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { MihrabArch } from "@/components/onboarding/illustrations/mihrab-arch";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function Stats() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      hero={
        <FadeSlideIn>
          <MihrabArch size={200}>
            <View className="items-center">
              <CountUp
                to={12480}
                className="font-serif text-[44px] leading-[50px] text-primary"
              />
              <Text className="font-sans text-caption text-tertiary tracking-widest mt-[4px]">
                MUSLIMS
              </Text>
            </View>
          </MihrabArch>
        </FadeSlideIn>
      }
      footer={<Button label="Continue" onPress={next} />}
    >
      <FadeSlideIn className="flex-1 items-center justify-center gap-md" delay={120}>
        <Headline size="h2">and growing every day.</Headline>
        <BodyText tone="muted" className="px-sm">
          You won't be alone. Thousands open Barakah at every adhan worldwide.
        </BodyText>
      </FadeSlideIn>
    </ScreenShell>
  );
}

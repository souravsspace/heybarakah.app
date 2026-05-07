import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { SuccessCheck } from "@/components/onboarding/illustrations/success-check";
import { TasbihRow } from "@/components/onboarding/illustrations/tasbih-row";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function Success() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell showBack={false} footer={<Button label="Almost done" onPress={next} />}>
      <FadeSlideIn className="flex-1 items-center justify-center gap-md">
        <SuccessCheck size={104} />
        <Headline>Your plan is ready.</Headline>
        <BodyText tone="muted" className="px-sm">
          Barakah is configured for your fiqh and your prayers. One last step.
        </BodyText>
        <TasbihRow width={200} count={11} />
      </FadeSlideIn>
    </ScreenShell>
  );
}

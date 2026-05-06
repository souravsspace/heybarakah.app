import { View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { LinkButton } from "@/components/onboarding/link-button";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function Commit() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      footer={
        <View className="gap-sm">
          <Button label="YES, I'M READY" onPress={next} />
          <LinkButton label="Not yet" onPress={() => {}} />
        </View>
      }
    >
      <FadeSlideIn
        className="flex-1 items-center justify-center gap-sm"
        delay={120}
      >
        <Headline>Are you ready to protect your salah?</Headline>
        <BodyText className="px-sm"tone="muted" >
          Make the niyyah. Barakah will hold you to it, gently, for as long as
          you let it.
        </BodyText>
      </FadeSlideIn>
    </ScreenShell>
  );
}

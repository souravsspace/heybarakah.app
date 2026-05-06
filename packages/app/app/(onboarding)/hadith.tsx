import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { TasbihRow } from "@/components/onboarding/illustrations/tasbih-row";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function Hadith() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell footer={<Button label="Ameen" onPress={next} />}>
      <FadeSlideIn className="flex-1 items-center justify-center gap-md">
        <TasbihRow width={200} count={9} />
        <Headline className="px-sm">
          "The most beloved deed to Allah is the one done regularly, even if little."
        </Headline>
        <View className="mt-sm">
          <Text className="font-sans text-body-sm text-tertiary text-center">
            Prophet Muhammad ﷺ
          </Text>
          <Text className="font-sans text-caption text-tertiary text-center mt-[2px]">
            Sahih al-Bukhari 6464
          </Text>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

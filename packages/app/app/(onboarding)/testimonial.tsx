import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function Testimonial() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell footer={<Button label="Continue" onPress={next} />}>
      <FadeSlideIn className="flex-1 items-center justify-center gap-md">
        <View className="flex-row gap-[2px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons key={i} name="star" size={20} color="#29603E" />
          ))}
        </View>
        <Headline size="h2">"Saved my fajr."</Headline>
        <View className="border-t border-neutral w-[60%] mt-sm" />
        <Text className="font-sans text-body text-tertiary text-center px-md">
          I used to scroll for an hour before sleeping and miss fajr every day. Two weeks
          with Barakah and I haven't missed once.
        </Text>
        <Text className="font-sans text-body-sm text-ink mt-md">— Yusuf, 28, London</Text>
      </FadeSlideIn>
    </ScreenShell>
  );
}

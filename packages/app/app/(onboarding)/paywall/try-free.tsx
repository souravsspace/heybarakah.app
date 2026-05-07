import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const FEATURES = [
  {
    title: "Block apps until you pray",
    image: require("../../../assets/images/onboarding/welcome/laying-pray.png"),
  },
  {
    title: "Smart prayer times",
    image: require("../../../assets/images/onboarding/welcome/al-quran.png"),
  },
  {
    title: "Daily streak",
    image: require("../../../assets/images/onboarding/welcome/tasbih.png"),
  },
  {
    title: "Wudu & focus",
    image: require("../../../assets/images/onboarding/welcome/wudu-man.png"),
  },
] as const;

export default function TryFree() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      footer={<Button label="Continue for FREE" onPress={next} />}
      scroll={false}
    >
      <FadeSlideIn className="flex-1">
        <View className="items-center mt-md mb-lg px-sm">
          <Headline>We want you to try Barakah for FREE</Headline>
        </View>

        <View
          className="flex-row flex-wrap"
          style={{ marginHorizontal: -6 }}
        >
          {FEATURES.map((f, i) => (
            <FadeSlideIn
              className="w-1/2 p-[6px]"
              delay={140 + i * 90}
              key={f.title}
            >
              <View
                className="bg-surface border border-neutral rounded-2xl items-center pt-md pb-md px-sm"
                style={{ minHeight: 178 }}
              >
                <View
                  className="bg-neutral-soft rounded-2xl items-center justify-center"
                  style={{ width: 104, height: 104 }}
                >
                  <Image
                    source={f.image}
                    style={{ width: 72, height: 72, resizeMode: "contain" }}
                  />
                </View>
                <Text
                  className="font-serif text-ink text-center mt-sm"
                  style={{ fontSize: 16, lineHeight: 22 }}
                >
                  {f.title}
                </Text>
              </View>
            </FadeSlideIn>
          ))}
        </View>

        <View
          className="flex-row items-center justify-center mt-lg"
          style={{ gap: 8 }}
        >
          <Ionicons color="#0F1311" name="checkmark" size={18} />
          <Text
            className="font-sans text-label text-ink"
            style={{ fontWeight: "600" }}
          >
            No Payment Due Now
          </Text>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { TasbihRow } from "@/components/onboarding/illustrations/tasbih-row";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const NEUTRAL = "#E5E7EB";

export default function Hadith() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Ameen" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1" delay={120}>
        <View
          style={{
            paddingHorizontal: 4,
            maxWidth: 360,
            alignSelf: "center",
            flex: 1,
          }}
        >
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
              HADITH · BUKHĀRĪ 6464
            </Text>
          </FadeSlideIn>

          <FadeSlideIn delay={280}>
            <Text
              className="font-serif text-ink"
              style={{
                marginTop: 32,
                fontSize: 19,
                lineHeight: 30,
                fontStyle: "italic",
              }}
            >
              <Text
                style={{
                  fontSize: 64,
                  lineHeight: 56,
                  fontWeight: "700",
                  color: ACCENT,
                  fontStyle: "normal",
                }}
              >
                T
              </Text>
              he most beloved deed to Allah is the one done regularly, even if
              little.
            </Text>
          </FadeSlideIn>

          <FadeSlideIn delay={460}>
            <View
              style={{
                height: 1,
                backgroundColor: NEUTRAL,
                marginTop: 28,
                marginBottom: 16,
              }}
            />
            <Text
              className="font-serif text-ink"
              style={{ fontSize: 15, fontWeight: "700", lineHeight: 20 }}
            >
              Prophet Muhammad ﷺ
            </Text>
            <Text
              className="font-sans text-caption text-tertiary"
              style={{ marginTop: 2 }}
            >
              Reported by Abū Hurayra
            </Text>
          </FadeSlideIn>

          <View style={{ flex: 1 }} />

          <FadeSlideIn className="items-center" delay={680}>
            <View style={{ opacity: 0.7 }}>
              <TasbihRow count={9} width={120} />
            </View>
          </FadeSlideIn>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

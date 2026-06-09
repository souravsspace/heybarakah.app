import { View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { MosqueGlow } from "@/components/onboarding/illustrations/mosque-glow";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function Commit() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      footer={<Button label="Ameen" onPress={next} />}
      scroll={false}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MosqueGlow size={420} />
      </View>

      <FadeSlideIn className="flex-1 justify-center" delay={120}>
        <View
          style={{
            maxWidth: 360,
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: 4,
          }}
        >
          <FadeSlideIn delay={160}>
            <Headline align="left" size="h2">
              Bismillāh.
            </Headline>
          </FadeSlideIn>

          <FadeSlideIn delay={420}>
            <View style={{ marginTop: 28 }}>
              <Headline align="left" size="h2">
                I commit to my five.
              </Headline>
            </View>
          </FadeSlideIn>

          <FadeSlideIn delay={760}>
            <View style={{ marginTop: 28 }}>
              <Headline align="left" size="h2">
                Help me return.
              </Headline>
            </View>
          </FadeSlideIn>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

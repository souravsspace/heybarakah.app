import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";

function Rule() {
  return <View style={{ width: 28, height: 1, backgroundColor: ACCENT }} />;
}

export default function Testimonial() {
  const { next } = useOnboardingNav();

  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Continue" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1" delay={120}>
        <View
          className="flex-1 justify-center"
          style={{ paddingHorizontal: 4, maxWidth: 360, alignSelf: "center" }}
        >
          <FadeSlideIn delay={140}>
            <Rule />
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 10,
                letterSpacing: 2.4,
                fontWeight: "700",
                marginTop: 12,
              }}
            >
              A LETTER
            </Text>
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 13,
                fontStyle: "italic",
                marginTop: 24,
                lineHeight: 20,
              }}
            >
              Two weeks in.
            </Text>
          </FadeSlideIn>

          <FadeSlideIn delay={260}>
            <View style={{ marginTop: 14 }}>
              <Headline align="left" size="h2">
                Saved my fajr.
              </Headline>
            </View>

            <Text
              className="font-sans text-body-sm text-tertiary"
              style={{
                marginTop: 18,
                lineHeight: 22,
                maxWidth: 320,
              }}
            >
              I used to scroll for an hour before sleeping and miss fajr every
              day.
            </Text>
            <Text
              className="font-sans text-body-sm text-tertiary"
              style={{
                marginTop: 12,
                lineHeight: 22,
                maxWidth: 320,
              }}
            >
              Two weeks with Barakah and I haven't missed once.
            </Text>
          </FadeSlideIn>

          <FadeSlideIn delay={420}>
            <View style={{ marginTop: 32 }}>
              <Rule />
              <Text
                className="font-serif text-ink"
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  lineHeight: 22,
                  marginTop: 12,
                }}
              >
                Yusuf
              </Text>
              <Text
                className="font-sans text-caption text-tertiary"
                style={{ marginTop: 2 }}
              >
                London · 28
              </Text>
            </View>
          </FadeSlideIn>
        </View>

        <FadeSlideIn className="items-center" delay={560}>
          <Text className="font-sans text-caption text-tertiary">
            12,400 keeping salah with Barakah
          </Text>
        </FadeSlideIn>
      </FadeSlideIn>
    </ScreenShell>
  );
}

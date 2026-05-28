import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

async function requestStoreReview(): Promise<void> {
  try {
    const mod = await import("expo-store-review");
    const available = await mod.isAvailableAsync();
    if (available) {
      await mod.requestReview();
    }
  } catch {
    // native module not in dev client yet — silently skip
  }
}

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";

export default function RatingPrompt() {
  const { next } = useOnboardingNav();

  async function rate() {
    await requestStoreReview();
    next();
  }

  return (
    <ScreenShell
      footer={
        <View style={{ gap: 8 }}>
          <Button label="Rate Barakah" onPress={rate} />
          <Pressable
            accessibilityRole="button"
            onPress={next}
            style={{ alignItems: "center", paddingVertical: 10 }}
          >
            <Text
              className="font-sans"
              style={{
                fontSize: 14,
                fontWeight: "600",
                letterSpacing: 0.4,
                color: MUTED,
              }}
            >
              Maybe later
            </Text>
          </Pressable>
        </View>
      }
      scroll={false}
    >
      <View
        className="flex-1"
        style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      >
        <FadeSlideIn delay={80}>
          <View className="flex-row items-baseline justify-between">
            <Text
              className="font-sans"
              style={{
                fontSize: 9,
                fontWeight: "800",
                letterSpacing: 3,
                color: ACCENT,
              }}
            >
              A SMALL ASK
            </Text>
            <Text
              className="font-sans"
              style={{
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 2.4,
                color: MUTED,
              }}
            >
              ONE MINUTE
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={220}>
          <View style={{ alignItems: "center", marginTop: 48 }}>
            <KhatamStar />
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={420}>
          <View style={{ marginTop: 40 }}>
            <Text
              className="font-serif"
              style={{
                fontSize: 30,
                lineHeight: 36,
                fontWeight: "700",
                color: INK,
                letterSpacing: -0.5,
                textAlign: "center",
              }}
            >
              Help one more{"\n"}Muslim return.
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={560}>
          <Text
            className="font-sans"
            style={{
              marginTop: 16,
              fontSize: 15,
              lineHeight: 22,
              color: MUTED,
              textAlign: "center",
              paddingHorizontal: 16,
            }}
          >
            A rating in the App Store costs you a tap. It costs another brother
            or sister nothing, and reaches them everything.
          </Text>
        </FadeSlideIn>

        <View style={{ flex: 1 }} />
      </View>
    </ScreenShell>
  );
}

function KhatamStar() {
  // Eight-point Khātam Sulaymānī geometric star — two overlapping squares.
  return (
    <Svg fill="none" height={140} viewBox="0 0 140 140" width={140}>
      <Path
        d="M70 6 L98 42 L134 70 L98 98 L70 134 L42 98 L6 70 L42 42 Z"
        stroke={ACCENT}
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
      <Path
        d="M22 22 L70 36 L118 22 L104 70 L118 118 L70 104 L22 118 L36 70 Z"
        stroke={ACCENT}
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
      <Path d="M70 50 L80 70 L70 90 L60 70 Z" fill={ACCENT} />
    </Svg>
  );
}

import { useEffect } from "react";
import { Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

const GREEN = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const HAIRLINE = "#E5E7EB";

export default function Strictness() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  // Lock length is fixed (~15 min around each prayer) in prayer-window-config.
  // There is no user-tunable strictness, so record a stable value once and let
  // this screen simply explain how the window works.
  useEffect(() => {
    if (state.strictness !== "full-window") {
      dispatch({
        type: "SET_FIELD",
        payload: { strictness: "full-window" },
      });
    }
  }, [state.strictness, dispatch]);

  return (
    <ScreenShell
      footer={<Button label="Continue" onPress={next} />}
      scroll={false}
    >
      <View
        className="flex-1"
        style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      >
        <FadeSlideIn delay={80}>
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Text
              className="font-serif"
              style={{
                fontSize: 96,
                lineHeight: 100,
                color: GREEN,
                letterSpacing: -2,
                fontVariant: ["tabular-nums"],
              }}
            >
              15
            </Text>
            <Text
              className="font-sans"
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 3,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Minutes
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={220}>
          <LockWindow />
        </FadeSlideIn>

        <FadeSlideIn delay={360}>
          <View style={{ marginTop: 28 }}>
            <Headline align="center" size="h1">
              Fifteen minutes.{"\n"}Then it lifts.
            </Headline>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={500}>
          <BodyText align="center" className="mt-md" size="md" tone="muted">
            When each prayer comes in, the apps that pull at you step aside —
            about fifteen minutes. Long enough to stand before Allah. Then they
            return on their own.
          </BodyText>
        </FadeSlideIn>

        <View style={{ flex: 1 }} />

        <FadeSlideIn delay={640}>
          <View
            className="flex-row items-center justify-center"
            style={{ gap: 10, marginBottom: 4 }}
          >
            <View
              style={{
                width: 18,
                height: 1,
                backgroundColor: GREEN,
                opacity: 0.5,
              }}
            />
            <Text
              className="font-sans"
              style={{
                fontSize: 12,
                lineHeight: 16,
                color: MUTED,
                textAlign: "center",
              }}
            >
              The same gentle window for every salah — fajr through isha.
            </Text>
            <View
              style={{
                width: 18,
                height: 1,
                backgroundColor: GREEN,
                opacity: 0.5,
              }}
            />
          </View>
        </FadeSlideIn>
      </View>
    </ScreenShell>
  );
}

function LockWindow() {
  return (
    <View style={{ marginTop: 32 }}>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Dot />
        <View style={{ flex: 1, height: 1, backgroundColor: HAIRLINE }} />
        <View
          style={{
            borderColor: GREEN,
            borderWidth: 1,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text
            className="font-sans"
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              color: GREEN,
            }}
          >
            LOCKED
          </Text>
        </View>
        <View style={{ flex: 1, height: 1, backgroundColor: HAIRLINE }} />
        <Dot />
      </View>
      <View
        className="flex-row items-center justify-between"
        style={{ marginTop: 10 }}
      >
        <Edge label="Adhan" />
        <Edge label="Back to you" />
      </View>
    </View>
  );
}

function Dot() {
  return (
    <View
      style={{
        width: 9,
        height: 9,
        borderRadius: 999,
        backgroundColor: GREEN,
      }}
    />
  );
}

function Edge({ label }: { label: string }) {
  return (
    <Text
      className="font-sans"
      style={{
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: INK,
      }}
    >
      {label}
    </Text>
  );
}

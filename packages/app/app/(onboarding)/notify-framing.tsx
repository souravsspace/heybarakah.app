import { Pressable, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const HAIRLINE = "#E5E7EB";
const WATERMARK = "rgba(15, 19, 17, 0.05)";

export default function NotifyFraming() {
  const { next } = useOnboardingNav();

  return (
    <ScreenShell
      footer={
        <View style={{ gap: 8 }}>
          <Button label="Enable reminders" onPress={next} />
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
              Not now
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
        <View
          style={{
            position: "relative",
            height: 280,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <FadeSlideIn delay={60}>
            <Text
              className="font-serif"
              style={{
                position: "absolute",
                top: -10,
                fontSize: 160,
                lineHeight: 160,
                color: WATERMARK,
                fontWeight: "700",
                letterSpacing: -6,
                fontVariant: ["tabular-nums"],
              }}
            >
              04:48
            </Text>
          </FadeSlideIn>

          <FadeSlideIn delay={260}>
            <NotificationMock />
          </FadeSlideIn>
        </View>

        <FadeSlideIn delay={420}>
          <View style={{ marginTop: 18 }}>
            <Text
              className="font-serif"
              style={{
                fontSize: 34,
                lineHeight: 38,
                fontWeight: "700",
                color: INK,
                letterSpacing: -0.6,
                textAlign: "center",
              }}
            >
              Never miss{"\n"}fajr again.
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={560}>
          <Text
            className="font-sans"
            style={{
              marginTop: 14,
              fontSize: 15,
              lineHeight: 22,
              color: MUTED,
              textAlign: "center",
            }}
          >
            A single quiet ping before each salah. Nothing more.
          </Text>
        </FadeSlideIn>

        <View style={{ flex: 1 }} />
      </View>
    </ScreenShell>
  );
}

function NotificationMock() {
  return (
    <View
      style={{
        width: 300,
        backgroundColor: "#FFFFFF",
        borderColor: HAIRLINE,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: ACCENT,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          className="font-serif"
          style={{ color: "#F4EDDF", fontSize: 16, fontWeight: "700" }}
        >
          B
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View
          className="flex-row items-baseline justify-between"
          style={{ gap: 8 }}
        >
          <Text
            className="font-sans"
            style={{ fontSize: 12, fontWeight: "700", color: INK }}
          >
            Barakah
          </Text>
          <Text
            className="font-sans"
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: MUTED,
              fontVariant: ["tabular-nums"],
            }}
          >
            now
          </Text>
        </View>
        <Text
          className="font-sans"
          style={{ fontSize: 13, color: INK, marginTop: 2 }}
        >
          Fajr in 10 minutes. The world is still asleep.
        </Text>
      </View>
    </View>
  );
}

import { ScrollView, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const CARD_TONES = ["#F2F4F1", "#EDF1ED", "#F2F4F1"];
const TICK = "rgba(41, 96, 62, 0.35)";

interface Review {
  city: string;
  folio: string;
  name: string;
  prayerLine: string;
  quote: string;
}

const REVIEWS: Review[] = [
  {
    folio: "٠١",
    name: "Aisha",
    city: "Toronto",
    quote:
      "I had not prayed fajr in months. The reminder is gentle, the lock on TikTok is not. I needed both.",
    prayerLine: "26 fajrs · 4 weeks",
  },
  {
    folio: "٠٢",
    name: "Bilal",
    city: "Kuala Lumpur",
    quote:
      "It does not nag. It shows me what I owe Allah, in plain numbers. The honesty changed me.",
    prayerLine: "53 prayers · 11 days",
  },
  {
    folio: "٠٣",
    name: "Maryam",
    city: "Birmingham",
    quote:
      "First app that treats salah like worship, not gamification. Alhamdulillah.",
    prayerLine: "5 daily prayers · 22 days",
  },
];

export default function Reviews() {
  const { next } = useOnboardingNav();

  return (
    <ScreenShell
      footer={<Button label="Continue" onPress={next} />}
      scroll={false}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}>
          <FadeSlideIn delay={80}>
            <View style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: ACCENT }}>✦</Text>
              <Text
                className="font-sans"
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: MUTED,
                  fontStyle: "italic",
                }}
              >
                From the ummah
              </Text>
            </View>
          </FadeSlideIn>

          <FadeSlideIn delay={200}>
            <View style={{ marginTop: 10 }}>
              <Text
                className="font-serif"
                style={{
                  fontSize: 32,
                  lineHeight: 38,
                  fontWeight: "700",
                  color: INK,
                  letterSpacing: -0.5,
                }}
              >
                Three returns,{"\n"}by His mercy.
              </Text>
            </View>
          </FadeSlideIn>

          <View style={{ marginTop: 24, gap: 12 }}>
            {REVIEWS.map((r, i) => (
              <FadeSlideIn delay={300 + i * 130} key={r.name}>
                <ReviewCard
                  bg={CARD_TONES[i % CARD_TONES.length] ?? "#F2F4F1"}
                  review={r}
                />
              </FadeSlideIn>
            ))}
          </View>

          <FadeSlideIn delay={780}>
            <Text
              className="font-sans"
              style={{
                marginTop: 18,
                fontSize: 11,
                color: MUTED,
                fontStyle: "italic",
              }}
            >
              Names changed. Words kept.
            </Text>
          </FadeSlideIn>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function ReviewCard({ review, bg }: { review: Review; bg: string }) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 18,
        paddingVertical: 24,
        paddingHorizontal: 22,
        overflow: "hidden",
      }}
    >
      {/* Decorative corner star — top-right ornament */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 14, right: 16 }}
      >
        <Text style={{ fontSize: 10, color: ACCENT, opacity: 0.55 }}>✦</Text>
      </View>

      {/* Top row: folio numeral (with tick) · city */}
      <View
        className="flex-row items-start"
        style={{ justifyContent: "space-between" }}
      >
        <View>
          <Text
            className="font-serif"
            style={{
              fontSize: 24,
              lineHeight: 26,
              color: ACCENT,
              fontWeight: "400",
              fontVariant: ["tabular-nums"],
            }}
          >
            {review.folio}
          </Text>
          <View
            style={{
              marginTop: 6,
              height: 1,
              width: 18,
              backgroundColor: TICK,
            }}
          />
        </View>
        <Text
          className="font-sans"
          style={{
            marginTop: 6,
            marginRight: 18,
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 2.6,
            color: MUTED,
          }}
        >
          {review.city.toUpperCase()}
        </Text>
      </View>

      {/* Open-quote glyph — manuscript pull-quote anchor */}
      <Text
        className="font-serif"
        style={{
          marginTop: 14,
          fontSize: 34,
          lineHeight: 28,
          color: ACCENT,
          fontWeight: "700",
        }}
      >
        ❝
      </Text>

      {/* Quote body */}
      <Text
        className="font-serif"
        style={{
          marginTop: 6,
          fontSize: 17,
          lineHeight: 26,
          color: INK,
          fontStyle: "italic",
        }}
      >
        {review.quote}
      </Text>

      {/* Footer: name · ✦ · prayer line */}
      <View
        className="flex-row items-center"
        style={{ marginTop: 18, justifyContent: "space-between" }}
      >
        <Text
          className="font-sans"
          style={{
            fontSize: 12,
            color: INK,
            fontWeight: "600",
          }}
        >
          {`— ${review.name}`}
        </Text>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Text style={{ fontSize: 8, color: ACCENT, opacity: 0.7 }}>✦</Text>
          <Text
            className="font-sans"
            style={{
              fontSize: 9,
              fontWeight: "700",
              letterSpacing: 1.8,
              color: ACCENT,
              fontVariant: ["tabular-nums"],
            }}
          >
            {review.prayerLine.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

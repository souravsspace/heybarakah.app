import { ScrollView, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const HAIRLINE = "#E5E7EB";

interface Review {
  city: string;
  fajrs: string;
  initial: string;
  name: string;
  quote: string;
}

const REVIEWS: Review[] = [
  {
    initial: "A",
    name: "Aisha",
    city: "Toronto",
    quote:
      "I had not prayed fajr in months. The reminder is gentle, the lock on TikTok is not. I needed both.",
    fajrs: "26 fajrs · 4 weeks",
  },
  {
    initial: "B",
    name: "Bilal",
    city: "Kuala Lumpur",
    quote:
      "It does not nag. It just shows me what I owe Allah, in plain numbers. The honesty changed me.",
    fajrs: "53 prayers · 11 days",
  },
  {
    initial: "M",
    name: "Maryam",
    city: "Birmingham",
    quote:
      "First app that treats salah like worship, not gamification. No streak fire emoji, alhamdulillah.",
    fajrs: "5 daily prayers · 22 days",
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
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}>
          <FadeSlideIn delay={80}>
            <Header />
          </FadeSlideIn>

          <FadeSlideIn delay={200}>
            <View style={{ marginTop: 18 }}>
              <Text
                className="font-serif"
                style={{
                  fontSize: 32,
                  lineHeight: 36,
                  fontWeight: "700",
                  color: INK,
                  letterSpacing: -0.5,
                }}
              >
                Returned, by{"\n"}the mercy of Allah.
              </Text>
            </View>
          </FadeSlideIn>

          <View style={{ marginTop: 28 }}>
            {REVIEWS.map((r, i) => (
              <FadeSlideIn delay={320 + i * 140} key={r.name}>
                <ReviewBlock review={r} />
              </FadeSlideIn>
            ))}
          </View>

          <FadeSlideIn delay={780}>
            <FooterMark />
          </FadeSlideIn>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function Header() {
  return (
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
        FROM THE UMMAH
      </Text>
      <Text
        className="font-sans"
        style={{
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 2.4,
          color: MUTED,
          fontVariant: ["tabular-nums"],
        }}
      >
        III VOICES
      </Text>
    </View>
  );
}

function ReviewBlock({ review }: { review: Review }) {
  return (
    <View style={{ paddingVertical: 18 }}>
      <View className="flex-row" style={{ gap: 16 }}>
        <Monogram letter={review.initial} />
        <View style={{ flex: 1 }}>
          <Text
            className="font-sans"
            style={{
              fontSize: 9,
              fontWeight: "800",
              letterSpacing: 2.4,
              color: MUTED,
            }}
          >
            {`${review.name.toUpperCase()} · ${review.city.toUpperCase()}`}
          </Text>
          <Text
            className="font-serif"
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: INK,
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            {`“${review.quote}”`}
          </Text>
          <Text
            className="font-sans"
            style={{
              marginTop: 10,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.8,
              color: ACCENT,
              fontVariant: ["tabular-nums"],
            }}
          >
            {review.fajrs.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 18, height: 1, backgroundColor: HAIRLINE }} />
    </View>
  );
}

function Monogram({ letter }: { letter: string }) {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: ACCENT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        className="font-serif"
        style={{
          fontSize: 16,
          color: ACCENT,
          fontWeight: "700",
        }}
      >
        {letter}
      </Text>
    </View>
  );
}

function FooterMark() {
  return (
    <View
      className="flex-row items-center"
      style={{ marginTop: 8, gap: 10, paddingBottom: 8 }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: HAIRLINE }} />
      <Text
        className="font-sans"
        style={{
          fontSize: 9,
          fontWeight: "800",
          letterSpacing: 3,
          color: MUTED,
        }}
      >
        REAL USERS · NAMES CHANGED
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: HAIRLINE }} />
    </View>
  );
}

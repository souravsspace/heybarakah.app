import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const MAX_PRICE = 15.49;
const MAX_HEIGHT = 253;
const BARAKAH_PRICE = 3.33;

const COMPETITORS = [
  {
    label: "Uber Eats",
    price: 9.99,
    logo: require("../../../assets/images/onboarding/paywall/uber-eats-logo.png"),
  },
  {
    label: "Netflix",
    price: 15.49,
    logo: require("../../../assets/images/onboarding/paywall/netflix-logo.avif"),
  },
  {
    label: "DoorDash",
    price: 9.99,
    logo: require("../../../assets/images/onboarding/paywall/doordash.png"),
  },
  {
    label: "Prime",
    price: 14.99,
    logo: require("../../../assets/images/onboarding/paywall/amazon_prime.png"),
  },
] as const;

const BAR_WIDTH = 64;
const LOGO_SIZE = 48;
const COMPETITOR_TONE = "#EAB5A8";
const BARAKAH_TONE = "#B5CFC0";

export default function AkhiraWorth() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      footer={<Button label="Try Barakah for $0.00" onPress={next} />}
      scroll={false}
    >
      <FadeSlideIn className="flex-1">
        <View className="items-center mt-md mb-md px-sm">
          <Headline>What's your {"\n"} akhira worth?</Headline>
          <BodyText className="mt-sm" size="sm" tone="muted">
            Barakah is cheaper than Netflix, Prime {"\n"} and your delivery
            habit.
          </BodyText>
        </View>

        <View
          className="flex-row items-end justify-between mt-lg"
          style={{ height: MAX_HEIGHT + 8 }}
        >
          {COMPETITORS.map((c, i) => {
            const h = (c.price / MAX_PRICE) * MAX_HEIGHT;
            return (
              <FadeSlideIn delay={220 + i * 110} key={c.label}>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: BAR_WIDTH,
                      height: h,
                      backgroundColor: COMPETITOR_TONE,
                      borderTopLeftRadius: 14,
                      borderTopRightRadius: 14,
                      alignItems: "center",
                      paddingTop: 10,
                    }}
                  >
                    <Image
                      source={c.logo}
                      style={{
                        width: LOGO_SIZE,
                        height: LOGO_SIZE,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                </View>
              </FadeSlideIn>
            );
          })}
          <FadeSlideIn delay={220 + COMPETITORS.length * 110}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: BAR_WIDTH,
                  height: (BARAKAH_PRICE / MAX_PRICE) * MAX_HEIGHT,
                  backgroundColor: BARAKAH_TONE,
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 14,
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Image
                  source={require("../../../assets/images/icon.png")}
                  style={{
                    width: LOGO_SIZE,
                    height: LOGO_SIZE,
                    resizeMode: "contain",
                    borderRadius: 12,
                    marginTop: -LOGO_SIZE / 4,
                  }}
                />
              </View>
            </View>
          </FadeSlideIn>
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
            Free Trial Included
          </Text>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

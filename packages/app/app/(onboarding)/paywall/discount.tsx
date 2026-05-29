import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { MihrabArch } from "@/components/onboarding/illustrations/mihrab-arch";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { useSubscription } from "@/lib/subscription";

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const HAIRLINE = "#E5E7EB";

const ORIGINAL_ANNUAL = "$39.99";
const DISCOUNTED_ANNUAL = "$23.99";

export default function DiscountPaywall() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const { user } = useUser();
  const { purchase, isPurchasing } = useSubscription();
  const { dispatch } = useOnboardingState();
  const [busy, setBusy] = useState(false);

  async function claim() {
    if (busy || isPurchasing) {
      return;
    }
    setBusy(true);
    try {
      const result = await purchase("yearly");
      if (result.ok) {
        const now = new Date().toISOString();
        dispatch({
          type: "SET_FIELD",
          payload: {
            purchasedPlan: "yearly",
            purchaseCompletedAt: now,
            trialStartedAt: now,
          },
        });
        if (user) {
          router.replace("/home");
        } else {
          goTo("/(account)/auth?mode=signup");
        }
        return;
      }
      if (result.cancelled) {
        return;
      }
      Alert.alert("Offer unavailable", result.reason);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      Alert.alert("Purchase failed", message);
    } finally {
      setBusy(false);
    }
  }

  function decline() {
    if (user) {
      router.replace("/home");
    } else {
      goTo("/(account)/auth?mode=signup");
    }
  }

  return (
    <ScreenShell
      footer={
        <View style={{ gap: 8 }}>
          <Button
            disabled={busy || isPurchasing}
            label="Claim 40% off"
            onPress={claim}
          />
          <Pressable
            accessibilityRole="button"
            onPress={decline}
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
              No thank you, continue without
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
        <FadeSlideIn delay={60}>
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
              ONE LAST MERCY
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
              FIRST YEAR ONLY
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={200}>
          <View style={{ alignItems: "center", marginTop: 18 }}>
            <MihrabArch ornate={false} size={180}>
              <View style={{ alignItems: "center" }}>
                <Text
                  className="font-serif"
                  style={{
                    fontSize: 64,
                    lineHeight: 64,
                    fontWeight: "700",
                    color: ACCENT,
                    letterSpacing: -2,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  40%
                </Text>
                <Text
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 3,
                    color: INK,
                    marginTop: 4,
                  }}
                >
                  OFF
                </Text>
              </View>
            </MihrabArch>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={360}>
          <View style={{ marginTop: 20 }}>
            <Text
              className="font-serif"
              style={{
                fontSize: 28,
                lineHeight: 34,
                fontWeight: "700",
                color: INK,
                letterSpacing: -0.5,
                textAlign: "center",
              }}
            >
              Do not let cost{"\n"}come between you{"\n"}and your salah.
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={520}>
          <PriceLine />
        </FadeSlideIn>

        <FadeSlideIn delay={620}>
          <Text
            className="font-sans"
            style={{
              marginTop: 14,
              fontSize: 12,
              lineHeight: 18,
              color: MUTED,
              textAlign: "center",
              paddingHorizontal: 16,
            }}
          >
            One-time offer for your first year. Renews at the regular annual
            price. Cancel anytime in App Store settings.
          </Text>
        </FadeSlideIn>

        <View style={{ flex: 1 }} />
      </View>
    </ScreenShell>
  );
}

function PriceLine() {
  return (
    <View
      className="flex-row items-center justify-center"
      style={{ marginTop: 22, gap: 14 }}
    >
      <Text
        className="font-sans"
        style={{
          fontSize: 18,
          fontWeight: "500",
          color: MUTED,
          textDecorationLine: "line-through",
          fontVariant: ["tabular-nums"],
        }}
      >
        {ORIGINAL_ANNUAL}
      </Text>
      <View style={{ width: 16, height: 1, backgroundColor: HAIRLINE }} />
      <View>
        <Text
          className="font-serif"
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: ACCENT,
            letterSpacing: -0.6,
            fontVariant: ["tabular-nums"],
          }}
        >
          {DISCOUNTED_ANNUAL}
        </Text>
        <View
          style={{
            height: 2,
            backgroundColor: ACCENT,
            marginTop: 2,
          }}
        />
      </View>
      <Text
        className="font-sans"
        style={{
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 2,
          color: MUTED,
        }}
      >
        / YEAR
      </Text>
    </View>
  );
}

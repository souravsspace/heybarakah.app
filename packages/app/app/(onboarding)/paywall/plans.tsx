import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { MosquePodium } from "@/components/onboarding/illustrations/mosque-podium";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { LINKS } from "@/constants/links";
import { PLANS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

type PlanId = (typeof PLANS)[number]["id"];

const PRIMARY = "#29603E";
const NEUTRAL_BORDER = "#E5E7EB";
const CARD_REST = "#F4F2EE";

export default function Plans() {
  const { state, dispatch } = useOnboardingState();
  const { goTo } = useOnboardingNav();
  const [showAll, setShowAll] = useState(false);
  const selected: PlanId = state.plan ?? "yearly";

  const visible = PLANS.filter((p) => showAll || p.id !== "lifetime");

  function setPlan(id: PlanId) {
    dispatch({ type: "SET_FIELD", payload: { plan: id } });
  }

  function start() {
    dispatch({
      type: "SET_FIELD",
      payload: {
        plan: selected,
        trialStartedAt:
          selected === "yearly" ? new Date().toISOString() : undefined,
      },
    });
    goTo("/(account)/auth");
  }

  const ctaLabel =
    selected === "yearly"
      ? "TRY FOR $0.00"
      : selected === "monthly"
        ? "START MONTHLY · $7.99/MO"
        : "GET LIFETIME · $99.99";

  const footerCaption =
    selected === "yearly"
      ? "7 days free, then $39.99 per year."
      : selected === "monthly"
        ? "$7.99 per month. Cancel anytime."
        : "Pay once. Keep forever. No subscription.";

  return (
    <ScreenShell
      footer={
        <View className="gap-sm">
          <Button label={ctaLabel} onPress={start} />
          {showAll ? (
            <Text className="text-center font-sans text-body-sm text-tertiary">
              {footerCaption}
            </Text>
          ) : (
            <Pressable
              className="items-center py-sm"
              onPress={() => setShowAll(true)}
            >
              <Text
                className="font-sans text-label text-tertiary"
                style={{ fontWeight: "600", letterSpacing: 0.6 }}
              >
                VIEW ALL PLANS
              </Text>
            </Pressable>
          )}
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="gap-md">
        <View
          className="flex-row items-center justify-between"
          style={{ paddingTop: 4 }}
        >
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <BarakahMark color="#4B5563" size={26} />
            <Text
              className="font-serif"
              style={{ fontSize: 20, letterSpacing: 0.4, color: "#4B5563" }}
            >
              Barakah
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 6 }}>
            <Pressable
              className="rounded-full bg-neutral-soft px-sm py-[5px]"
              onPress={() => Linking.openURL(LINKS.terms)}
            >
              <Text className="font-sans text-caption text-tertiary">
                T&Cs · Privacy
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-neutral-soft px-sm py-[5px]"
              onPress={() => goTo("/(account)/auth")}
            >
              <Text className="font-sans text-caption text-tertiary">
                Subscribed?
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="items-center" style={{ marginTop: showAll ? 4 : 12 }}>
          <MosquePodium size={showAll ? 132 : 176} />
        </View>

        <View className="px-sm" style={{ marginTop: showAll ? 4 : 8 }}>
          <Headline size="h2">
            Lock in your five.{"\n"}Begin the return.
          </Headline>
        </View>

        <View style={{ marginTop: showAll ? 18 : 16, gap: 22 }}>
          {visible.map((p) => {
            const isSelected = selected === p.id;
            const isYearly = p.id === "yearly";
            const isLifetime = p.id === "lifetime";
            const strikePrice =
              p.id === "yearly"
                ? "$239.88"
                : p.id === "monthly"
                  ? "$19.99"
                  : "$199";
            const leftSub =
              p.id === "yearly"
                ? "12 mo · $39.99"
                : p.id === "monthly"
                  ? "1 mo · $7.99"
                  : "Pay once · $99.99";
            const rightLabel =
              p.id === "yearly"
                ? "≈ $3.33 / mo"
                : p.id === "monthly"
                  ? "$7.99 / mo"
                  : "Lifetime";

            return (
              <Pressable
                key={p.id}
                onPress={() => setPlan(p.id)}
                style={{ position: "relative" }}
              >
                {isYearly ? (
                  <View
                    className="absolute z-10 rounded-full px-sm py-[3px]"
                    style={{
                      top: -10,
                      left: 16,
                      backgroundColor: PRIMARY,
                    }}
                  >
                    <Text
                      className="font-sans text-label-sm text-surface"
                      style={{ letterSpacing: 0.6, fontWeight: "700" }}
                    >
                      7 DAY FREE TRIAL
                    </Text>
                  </View>
                ) : null}
                {isLifetime ? (
                  <View
                    className="absolute z-10 rounded-full px-sm py-[3px]"
                    style={{
                      top: -10,
                      left: 16,
                      backgroundColor: "#0F1311",
                    }}
                  >
                    <Text
                      className="font-sans text-label-sm text-surface"
                      style={{ letterSpacing: 0.6, fontWeight: "700" }}
                    >
                      BEST VALUE
                    </Text>
                  </View>
                ) : null}
                {isSelected ? (
                  <View
                    className="absolute z-10 rounded-full"
                    style={{
                      top: -8,
                      right: 12,
                      width: 22,
                      height: 22,
                      backgroundColor: PRIMARY,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons color="#F4EDDF" name="checkmark" size={14} />
                  </View>
                ) : null}
                <View
                  className="flex-row items-center justify-between rounded-2xl px-md py-md"
                  style={{
                    borderWidth: 2.5,
                    borderColor: isSelected ? PRIMARY : NEUTRAL_BORDER,
                    backgroundColor: isSelected ? "#FFFFFF" : CARD_REST,
                  }}
                >
                  <View className="flex-1 pr-sm">
                    <View
                      className="flex-row items-baseline"
                      style={{ gap: 10 }}
                    >
                      <Text
                        className="font-sans text-ink"
                        style={{ fontSize: 18, fontWeight: "700" }}
                      >
                        {p.name}
                      </Text>
                      {strikePrice ? (
                        <Text
                          className="font-sans text-tertiary"
                          style={{
                            fontSize: 15,
                            fontWeight: "500",
                            textDecorationLine: "line-through",
                          }}
                        >
                          {strikePrice}
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      className="font-sans text-tertiary"
                      style={{ fontSize: 14, fontWeight: "500", marginTop: 4 }}
                    >
                      {leftSub}
                    </Text>
                  </View>
                  <Text
                    className="font-sans text-ink"
                    style={{ fontSize: 17, fontWeight: "700" }}
                  >
                    {rightLabel}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

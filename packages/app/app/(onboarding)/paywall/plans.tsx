import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { PlanCard } from "@/components/onboarding/plan-card";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { PLANS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

type Tab = "yearly" | "monthly";

export default function Plans() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();
  const [tab, setTab] = useState<Tab>(
    state.plan === "monthly" ? "monthly" : "yearly",
  );
  const visiblePlans = PLANS.filter((p) =>
    tab === "yearly" ? p.id !== "monthly" : p.id === "monthly",
  );
  const selected = state.plan ?? "yearly";

  return (
    <ScreenShell footer={<Button label="Continue" onPress={next} />}>
      <FadeSlideIn className="gap-md">
        <View className="gap-sm items-center">
          <Headline size="h2">Choose your path.</Headline>
          <BodyText tone="muted">
            All plans include the full prayer-lock system.
          </BodyText>
        </View>

        <View className="flex-row bg-neutral-soft rounded-full p-[4px] mt-md">
          {(["yearly", "monthly"] as const).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => {
                  setTab(t);
                  if (t === "monthly") {
                    dispatch({
                      type: "SET_FIELD",
                      payload: { plan: "monthly" },
                    });
                  } else {
                    dispatch({ type: "SET_FIELD", payload: { plan: "yearly" } });
                  }
                }}
                className={`flex-1 h-[40px] items-center justify-center rounded-full ${
                  active ? "bg-surface" : ""
                }`}
                style={
                  active
                    ? {
                        shadowColor: "#000",
                        shadowOpacity: 0.04,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                      }
                    : undefined
                }
              >
                <Text
                  className={`font-sans text-label ${
                    active ? "text-ink" : "text-tertiary"
                  }`}
                  style={{ fontWeight: active ? "600" : "500" }}
                >
                  {t === "yearly" ? "Yearly" : "Monthly"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-sm mt-md">
          {visiblePlans.map((p) => (
            <PlanCard
              key={p.id}
              name={p.name}
              price={p.price}
              cadence={p.cadence}
              perMonth={p.perMonth}
              badge={p.badge}
              recommended={p.recommended}
              selected={selected === p.id}
              onPress={() =>
                dispatch({ type: "SET_FIELD", payload: { plan: p.id } })
              }
            />
          ))}
        </View>

        <Text className="font-sans text-caption text-tertiary text-center mt-md px-sm">
          Cancel anytime. Auto-renews. Manage in App Store or Google Play.
        </Text>
      </FadeSlideIn>
    </ScreenShell>
  );
}

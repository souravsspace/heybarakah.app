import { Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { LinkButton } from "@/components/onboarding/link-button";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { PLANS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Checkout() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();
  const plan = PLANS.find((p) => p.id === (state.plan ?? "yearly"))!;

  function startTrial() {
    dispatch({
      type: "SET_FIELD",
      payload: {
        plan: plan.id,
        trialStartedAt: new Date().toISOString(),
      },
    });
    next();
  }

  return (
    <ScreenShell
      footer={
        <View className="gap-sm">
          <Button label="START 7-DAY FREE TRIAL" onPress={startTrial} />
          <LinkButton label="Restore purchase" onPress={() => {}} />
        </View>
      }
    >
      <FadeSlideIn className="flex-1 items-center justify-center gap-md">
        <Headline>7 days free.</Headline>
        <BodyText tone="muted" className="px-sm">
          Then {plan.price} per {plan.cadence}. Cancel anytime in settings.
        </BodyText>
        <View className="border border-neutral rounded-lg px-md py-md mt-md w-full">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans text-label text-ink">{plan.name} plan</Text>
            <Text className="font-serif text-h3 text-primary">{plan.price}</Text>
          </View>
          {plan.perMonth ? (
            <Text className="font-sans text-body-sm text-tertiary mt-[4px]">
              {plan.perMonth}
            </Text>
          ) : null}
        </View>
        <Text className="font-sans text-caption text-tertiary text-center mt-md px-sm">
          Auto-renews until canceled. Manage in App Store or Google Play.
        </Text>
      </FadeSlideIn>
    </ScreenShell>
  );
}

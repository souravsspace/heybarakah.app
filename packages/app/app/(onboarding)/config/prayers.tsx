import { View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { ToggleRow } from "@/components/onboarding/toggle-row";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

const PRAYERS = [
  { key: "fajr", label: "Fajr", hint: "Before sunrise" },
  { key: "dhuhr", label: "Dhuhr", hint: "After zenith" },
  { key: "asr", label: "Asr", hint: "Late afternoon" },
  { key: "maghrib", label: "Maghrib", hint: "Just after sunset" },
  { key: "isha", label: "Isha", hint: "Night" },
] as const;

export default function PrayersToLock() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();
  const anyOn = Object.values(state.prayersToLock).some(Boolean);

  return (
    <ScreenShell footer={<Button label="Continue" onPress={next} disabled={!anyOn} />}>
      <FadeSlideIn className="gap-md">
        <View className="gap-sm">
          <Headline size="h2" align="left">
            Which prayers should we lock?
          </Headline>
          <BodyText tone="muted" align="left">
            Start with all five. You can adjust anytime.
          </BodyText>
        </View>
        <View className="gap-sm mt-sm">
          {PRAYERS.map((p) => (
            <ToggleRow
              key={p.key}
              label={p.label}
              hint={p.hint}
              value={state.prayersToLock[p.key]}
              onToggle={() => dispatch({ type: "TOGGLE_PRAYER", key: p.key })}
            />
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

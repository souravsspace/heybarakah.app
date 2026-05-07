import { View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { ToggleRow } from "@/components/onboarding/toggle-row";
import { Button } from "@/components/ui/button";
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
    <ScreenShell
      footer={<Button disabled={!anyOn} label="Continue" onPress={next} />}
    >
      <FadeSlideIn className="gap-md">
        <View className="gap-sm">
          <Headline align="left" size="h2">
            Which prayers should we lock?
          </Headline>
          <BodyText align="left" tone="muted">
            Start with all five. You can adjust anytime.
          </BodyText>
        </View>
        <View className="mt-sm gap-sm">
          {PRAYERS.map((p) => (
            <ToggleRow
              hint={p.hint}
              key={p.key}
              label={p.label}
              onToggle={() => dispatch({ type: "TOGGLE_PRAYER", key: p.key })}
              value={state.prayersToLock[p.key]}
            />
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

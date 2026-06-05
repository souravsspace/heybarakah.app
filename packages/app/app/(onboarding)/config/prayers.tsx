import type { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { PrayerSelectRow } from "@/components/onboarding/prayer-select-row";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

const PRAYERS = [
  {
    key: "fajr",
    label: "Fajr",
    arabic: "فجر",
    hint: "Before sunrise",
    icon: "moon",
  },
  {
    key: "dhuhr",
    label: "Dhuhr",
    arabic: "ظهر",
    hint: "After zenith",
    icon: "sunny",
  },
  {
    key: "asr",
    label: "Asr",
    arabic: "عصر",
    hint: "Late afternoon",
    icon: "partly-sunny",
  },
  {
    key: "maghrib",
    label: "Maghrib",
    arabic: "مغرب",
    hint: "Just after sunset",
    icon: "partly-sunny-outline",
  },
  {
    key: "isha",
    label: "Isha",
    arabic: "عشاء",
    hint: "Night",
    icon: "moon-outline",
  },
] as const satisfies readonly {
  arabic: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  label: string;
}[];

export default function PrayersToLock() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();
  const anyOn = Object.values(state.prayersToLock).some(Boolean);
  const selectedCount = PRAYERS.filter(
    (p) => state.prayersToLock[p.key]
  ).length;
  const allSelected = selectedCount === PRAYERS.length;

  function toggleAll() {
    const target = !allSelected;
    for (const prayer of PRAYERS) {
      if (state.prayersToLock[prayer.key] !== target) {
        dispatch({ type: "TOGGLE_PRAYER", key: prayer.key });
      }
    }
  }

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
          <View className="flex-row items-center justify-between">
            <Text
              className="font-sans text-body-sm text-tertiary"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {selectedCount} of {PRAYERS.length} selected
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={toggleAll}
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <Text className="font-sans text-label-sm text-primary">
                {allSelected ? "Clear all" : "Select all"}
              </Text>
            </Pressable>
          </View>
          {PRAYERS.map((p, index) => (
            <FadeSlideIn delay={index * 60} key={p.key}>
              <PrayerSelectRow
                arabic={p.arabic}
                hint={p.hint}
                icon={p.icon}
                label={p.label}
                onPress={() => dispatch({ type: "TOGGLE_PRAYER", key: p.key })}
                selected={state.prayersToLock[p.key]}
              />
            </FadeSlideIn>
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import {
  type OnboardingState,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";

const ALL_PRAYERS_TO_LOCK: OnboardingState["prayersToLock"] = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

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

  useEffect(() => {
    if (Object.values(state.prayersToLock).every(Boolean)) {
      return;
    }

    dispatch({
      type: "SET_FIELD",
      payload: { prayersToLock: ALL_PRAYERS_TO_LOCK },
    });
  }, [dispatch, state.prayersToLock]);

  return (
    <ScreenShell footer={<Button label="Continue" onPress={next} />}>
      <FadeSlideIn className="gap-md">
        <View className="gap-sm">
          <Headline align="left" size="h2">
            All five prayers, protected
          </Headline>
          <BodyText align="left" tone="muted">
            Every salah is locked by default with no opt-out. You can adjust
            lock duration later in settings.
          </BodyText>
        </View>
        <View className="mt-sm overflow-hidden rounded-lg border border-neutral bg-surface">
          {PRAYERS.map((p, index) => (
            <PrayerLockRow
              arabic={p.arabic}
              hint={p.hint}
              icon={p.icon}
              isLast={index === PRAYERS.length - 1}
              key={p.key}
              label={p.label}
            />
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function PrayerLockRow({
  label,
  arabic,
  hint,
  icon,
  isLast,
}: {
  arabic: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLast: boolean;
  label: string;
}) {
  return (
    <View
      className={`flex-row items-center gap-sm px-md py-sm ${
        isLast ? "" : "border-neutral border-b"
      }`}
    >
      <View className="h-[38px] w-[38px] items-center justify-center rounded-md bg-cream-soft">
        <Ionicons color="#29603E" name={icon} size={20} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-baseline gap-xs">
          <Text className="font-sans text-ink text-label">{label}</Text>
          <Text className="font-sans text-body-sm text-tertiary">{arabic}</Text>
        </View>
        <Text className="mt-[2px] font-sans text-body-sm text-tertiary">
          {hint}
        </Text>
      </View>
    </View>
  );
}

import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

const PRAYER_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const ARABIC_NUMERALS = ["١", "٢", "٣", "٤", "٥"];

function labelFor<T extends { value: string; label: string }>(
  list: readonly T[],
  value: string | undefined
): string {
  if (!value) {
    return "Not set";
  }
  return list.find((o) => o.value === value)?.label ?? "Not set";
}

export default function PlanSummary() {
  const { next } = useOnboardingNav();
  const { state } = useOnboardingState();

  const lockedPrayers = (
    Object.keys(state.prayersToLock) as (keyof typeof state.prayersToLock)[]
  )
    .filter((k) => state.prayersToLock[k])
    .map((k) => PRAYER_LABELS[k] ?? k);

  const rows = [
    { label: "Madhab", value: labelFor(QUIZ_OPTIONS.madhab, state.madhab) },
    {
      label: "Calculation",
      value: labelFor(QUIZ_OPTIONS.calcMethod, state.calcMethod),
    },
    {
      label: "Strictness",
      value: labelFor(QUIZ_OPTIONS.strictness, state.strictness),
    },
    {
      label: "Tracked",
      value:
        lockedPrayers.length === 0 || lockedPrayers.length === 5
          ? "All five"
          : `${lockedPrayers.length} of 5`,
    },
    { label: "Goal", value: labelFor(QUIZ_OPTIONS.goal, state.goal) },
  ];

  const showPrayerCaption =
    lockedPrayers.length > 0 && lockedPrayers.length < 5;

  return (
    <ScreenShell
      footer={<Button label="This is mine" onPress={next} />}
      scroll={false}
    >
      <View
        className="flex-1"
        style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      >
        <FadeSlideIn delay={80}>
          <BismillahMark />
        </FadeSlideIn>

        <FadeSlideIn delay={220}>
          <View style={{ marginTop: 20 }}>
            <Headline align="left" size="h1">
              My covenant.
            </Headline>
            <Text
              className="font-sans text-tertiary"
              style={{
                marginTop: 8,
                fontSize: 13,
                lineHeight: 18,
                fontStyle: "italic",
              }}
            >
              Five prayers, one return.
            </Text>
          </View>
        </FadeSlideIn>

        <View style={{ marginTop: 24 }}>
          {rows.map((row, i) => (
            <FadeSlideIn delay={300 + i * 70} key={row.label}>
              <CovenantRow
                index={i}
                isLast={i === rows.length - 1}
                label={row.label}
                value={row.value}
              />
            </FadeSlideIn>
          ))}
        </View>

        {showPrayerCaption ? (
          <FadeSlideIn delay={720}>
            <View
              className="flex-row items-center"
              style={{ marginTop: 14, gap: 10 }}
            >
              <View
                className="bg-primary"
                style={{ width: 18, height: 1, opacity: 0.5 }}
              />
              <Text
                className="font-sans text-caption text-tertiary"
                style={{ flex: 1 }}
              >
                {lockedPrayers.join(" · ")}
              </Text>
            </View>
          </FadeSlideIn>
        ) : null}

        <View style={{ flex: 1, minHeight: 16 }} />
      </View>
    </ScreenShell>
  );
}

function BismillahMark() {
  return (
    <View className="items-center" style={{ paddingTop: 8 }}>
      <Text
        className="font-serif text-ink"
        style={{ fontSize: 32, lineHeight: 38 }}
      >
        ﷽
      </Text>
    </View>
  );
}

function CovenantRow({
  index,
  label,
  value,
  isLast,
}: {
  index: number;
  label: string;
  value: string;
  isLast: boolean;
}) {
  return (
    <View>
      <View
        className="flex-row items-center"
        style={{ paddingVertical: 14, gap: 14 }}
      >
        <Text
          className="font-serif text-primary"
          style={{
            width: 20,
            fontSize: 16,
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          {ARABIC_NUMERALS[index]}
        </Text>
        <Text
          className="font-sans text-tertiary"
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2.2,
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {label}
        </Text>
        <Text
          className="text-right font-serif text-ink"
          style={{ fontSize: 17, lineHeight: 22, flex: 1 }}
        >
          {value}
        </Text>
      </View>
      {isLast ? null : (
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(15, 19, 17, 0.08)",
          }}
        />
      )}
    </View>
  );
}

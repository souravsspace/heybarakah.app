import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const LINE = "rgba(15, 19, 17, 0.14)";

const PRAYER_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

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
        lockedPrayers.length > 0
          ? `${lockedPrayers.length} of 5 · ${lockedPrayers.join(", ")}`
          : "All five",
    },
    { label: "Goal", value: labelFor(QUIZ_OPTIONS.goal, state.goal) },
  ];

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
          <Masthead />
        </FadeSlideIn>

        <FadeSlideIn delay={180}>
          <Title />
        </FadeSlideIn>

        <View style={{ marginTop: 24 }}>
          {rows.map((row, i) => (
            <FadeSlideIn delay={280 + i * 80} key={row.label}>
              <LedgerRow index={i + 1} label={row.label} value={row.value} />
            </FadeSlideIn>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 16 }} />

        <FadeSlideIn delay={780}>
          <SealLine />
        </FadeSlideIn>
      </View>
    </ScreenShell>
  );
}

function Masthead() {
  return (
    <View>
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
          ﷽
        </Text>
        <Text
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 3,
            color: INK,
          }}
        >
          YOUR LEDGER
        </Text>
        <Text
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 2.4,
            color: MUTED,
            fontVariant: ["tabular-nums"],
          }}
        >
          FOLIO I
        </Text>
      </View>
      <View style={{ marginTop: 10, height: 1, backgroundColor: LINE }} />
    </View>
  );
}

function Title() {
  return (
    <View style={{ marginTop: 22 }}>
      <Text
        className="font-serif"
        style={{
          fontSize: 38,
          lineHeight: 42,
          fontWeight: "700",
          color: INK,
          letterSpacing: -0.6,
        }}
      >
        Your{"\n"}covenant.
      </Text>
    </View>
  );
}

function LedgerRow({
  index,
  label,
  value,
}: {
  index: number;
  label: string;
  value: string;
}) {
  return (
    <View style={{ paddingVertical: 12 }}>
      <View className="flex-row" style={{ gap: 14 }}>
        <Text
          className="font-serif"
          style={{
            width: 22,
            fontSize: 13,
            color: ACCENT,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
            paddingTop: 4,
          }}
        >
          {`0${index}`}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            className="font-sans"
            style={{
              fontSize: 9,
              fontWeight: "800",
              letterSpacing: 2.4,
              color: MUTED,
            }}
          >
            {label.toUpperCase()}
          </Text>
          <Text
            className="font-serif"
            style={{
              fontSize: 17,
              lineHeight: 22,
              color: INK,
              marginTop: 4,
              fontWeight: "700",
            }}
          >
            {value}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 12, height: 1, backgroundColor: LINE }} />
    </View>
  );
}

function SealLine() {
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 10, marginBottom: 4 }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
      <Text
        className="font-sans"
        style={{
          fontSize: 9,
          fontWeight: "800",
          letterSpacing: 3,
          color: MUTED,
        }}
      >
        SEALED FOR YOU
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
    </View>
  );
}

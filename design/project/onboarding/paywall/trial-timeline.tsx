import { Text, View } from "react-native";

const PRIMARY = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";

interface Step {
  body: string;
  dot: "filled" | "outline";
  marker: string;
}

const STEPS: Step[] = [
  { dot: "filled", marker: "Today", body: "Full access unlocked." },
  { dot: "outline", marker: "Day 5", body: "Reminder before billing." },
  {
    dot: "outline",
    marker: "Day 7",
    body: "Billing begins, cancel anytime.",
  },
];

export function TrialTimeline() {
  return (
    <View style={{ marginTop: 8 }}>
      {STEPS.map((step, i) => (
        <Row isLast={i === STEPS.length - 1} key={step.marker} step={step} />
      ))}
    </View>
  );
}

function Row({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <View style={{ flexDirection: "row", minHeight: 56 }}>
      <View style={{ alignItems: "center", width: 22 }}>
        <Dot variant={step.dot} />
        {isLast ? null : (
          <View style={{ flex: 1, width: 1, backgroundColor: LINE }} />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12, paddingBottom: isLast ? 0 : 18 }}>
        <Text
          className="font-serif"
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: INK,
            fontVariant: ["tabular-nums"],
          }}
        >
          {step.marker}
        </Text>
        <Text
          className="font-sans"
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: MUTED,
            marginTop: 2,
          }}
        >
          {step.body}
        </Text>
      </View>
    </View>
  );
}

function Dot({ variant }: { variant: Step["dot"] }) {
  const filled = variant === "filled";
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
        backgroundColor: filled ? PRIMARY : "transparent",
        borderWidth: filled ? 0 : 1.5,
        borderColor: PRIMARY,
      }}
    />
  );
}

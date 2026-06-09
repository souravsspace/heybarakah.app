import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";
const SUBTLE = "#9CA3AF";
const HAIRLINE = "#E5E7EB";
const LINE = "rgba(15, 19, 17, 0.14)";
const LINE_ACCENT = "rgba(41, 96, 62, 0.42)";
const MARKER_OUTLINE = "rgba(15, 19, 17, 0.2)";
const TICK = "rgba(107, 114, 128, 0.5)";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Testimonial() {
  const { next } = useOnboardingNav();

  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Continue" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <View
        className="flex-1"
        style={{ width: "100%", maxWidth: 340, alignSelf: "center" }}
      >
        <FadeSlideIn delay={80}>
          <Masthead />
        </FadeSlideIn>

        <FadeSlideIn delay={180}>
          <Heading />
        </FadeSlideIn>

        <View style={{ marginTop: 24 }}>
          <FadeSlideIn delay={280}>
            <WeekStrip
              dateline="OCT 02 – 08"
              label="MISSED"
              labelTone={INK}
              prayed={false}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={460}>
            <TurnBar />
          </FadeSlideIn>

          <FadeSlideIn delay={580}>
            <WeekStrip
              dateline="OCT 09 – 15"
              label="PRAYED"
              labelTone={ACCENT}
              prayed
              showToday
            />
          </FadeSlideIn>
        </View>

        <FadeSlideIn delay={700}>
          <Sum />
        </FadeSlideIn>

        <View style={{ flex: 1, minHeight: 16 }} />

        <FadeSlideIn delay={820}>
          <Caption />
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
          style={{
            fontSize: 16,
            color: ACCENT,
            fontWeight: "600",
            lineHeight: 18,
          }}
        >
          {"الفجر"}
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
          LEDGER
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
          NO. XIV
        </Text>
      </View>
      <View style={{ marginTop: 10, height: 1, backgroundColor: LINE }} />
    </View>
  );
}

function Heading() {
  return (
    <View style={{ marginTop: 22 }}>
      <Text
        className="font-serif"
        style={{
          fontSize: 40,
          lineHeight: 44,
          fontWeight: "700",
          color: INK,
          letterSpacing: -0.7,
        }}
      >
        Saved my{"\n"}fajr.
      </Text>
      <View className="flex-row" style={{ marginTop: 14, gap: 4 }}>
        <Square color={ACCENT} size={4} />
        <Square color={ACCENT} size={4} />
        <Square color={ACCENT} size={4} />
      </View>
    </View>
  );
}

function Square({ size, color }: { size: number; color: string }) {
  return <View style={{ width: size, height: size, backgroundColor: color }} />;
}

function WeekStrip({
  dateline,
  label,
  labelTone,
  prayed,
  showToday = false,
}: {
  dateline: string;
  label: string;
  labelTone: string;
  prayed: boolean;
  showToday?: boolean;
}) {
  return (
    <View>
      <View
        className="flex-row items-baseline"
        style={{ marginBottom: 10, gap: 8 }}
      >
        <Text
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 2.4,
            color: labelTone,
          }}
        >
          {label}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
        <Text
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 2,
            color: MUTED,
            fontVariant: ["tabular-nums"],
          }}
        >
          {dateline}
        </Text>
      </View>

      {prayed ? <MarkerRow prayed={prayed} /> : <WeekdayRow prayed={prayed} />}

      <View style={{ height: 6 }} />

      {prayed ? <WeekdayRow prayed={prayed} /> : <MarkerRow prayed={prayed} />}

      {showToday ? (
        <View className="flex-row" style={{ marginTop: 4 }}>
          {WEEKDAYS.map((_, i) => (
            <View className="flex-1 items-center" key={i}>
              {i === WEEKDAYS.length - 1 ? (
                <Text
                  className="font-sans"
                  style={{
                    fontSize: 8,
                    fontWeight: "800",
                    letterSpacing: 2,
                    color: ACCENT,
                  }}
                >
                  TODAY
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function WeekdayRow({ prayed }: { prayed: boolean }) {
  return (
    <View className="flex-row">
      {WEEKDAYS.map((w, i) => (
        <View className="flex-1 items-center" key={i}>
          <Text
            className="font-sans"
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1,
              color: prayed ? INK : MUTED,
            }}
          >
            {w}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MarkerRow({ prayed }: { prayed: boolean }) {
  return (
    <View className="flex-row">
      {WEEKDAYS.map((_, i) => (
        <View className="flex-1 items-center" key={i}>
          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: prayed ? ACCENT : "transparent",
              borderWidth: prayed ? 0 : 1,
              borderColor: MARKER_OUTLINE,
            }}
          />
        </View>
      ))}
    </View>
  );
}

function TurnBar() {
  return (
    <View style={{ marginVertical: 14 }}>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: LINE_ACCENT }} />
        <Text
          className="font-sans"
          style={{
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 3.2,
            color: ACCENT,
          }}
        >
          BARAKAH
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: LINE_ACCENT }} />
      </View>
      <Text
        className="font-sans"
        style={{
          marginTop: 5,
          textAlign: "center",
          fontSize: 8,
          fontWeight: "700",
          letterSpacing: 2.2,
          color: MUTED,
          fontVariant: ["tabular-nums"],
        }}
      >
        21:47 · OCT 09
      </Text>
    </View>
  );
}

function Sum() {
  return (
    <View style={{ marginTop: 22 }}>
      <View style={{ height: 1, backgroundColor: LINE }} />
      <View
        className="flex-row items-end justify-end"
        style={{ marginTop: 12, gap: 12 }}
      >
        <Text
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 2.4,
            color: MUTED,
            paddingBottom: 6,
          }}
        >
          FAJRS KEPT
        </Text>
        <Text
          className="font-serif"
          style={{
            fontSize: 44,
            fontWeight: "700",
            color: ACCENT,
            letterSpacing: -1,
            lineHeight: 46,
            fontVariant: ["tabular-nums"],
          }}
        >
          7/7
        </Text>
      </View>
    </View>
  );
}

function Caption() {
  return (
    <View style={{ marginBottom: 4, position: "relative" }}>
      <Text
        className="font-serif"
        style={{
          position: "absolute",
          left: -4,
          top: -16,
          fontSize: 46,
          lineHeight: 46,
          color: ACCENT,
          fontWeight: "700",
        }}
      >
        {"“"}
      </Text>
      <Text
        className="font-serif"
        style={{
          marginLeft: 24,
          fontSize: 14,
          lineHeight: 22,
          fontStyle: "italic",
          color: INK,
        }}
      >
        The phone won every night. Then it didn{"’"}t. The screen goes quiet
        before fajr, and so do I.{"”"}
      </Text>
      <View
        className="flex-row items-center"
        style={{ marginLeft: 24, marginTop: 12, gap: 8 }}
      >
        <View style={{ width: 14, height: 1, backgroundColor: TICK }} />
        <Text
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 2.4,
            color: MUTED,
          }}
        >
          YUSUF · LONDON · AGED 28
        </Text>
      </View>
    </View>
  );
}

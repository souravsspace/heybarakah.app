import { Button, Gauge, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

interface DhikrConfig {
  style: string;
}

/** Stable interaction target — matched by `addUserInteractionListener`. */
export const DHIKR_INCREMENT_TARGET = "increment";

function DhikrLayout(
  props: WidgetProps,
  environment: WidgetEnvironment<DhikrConfig>,
) {
  "widget";

  const DHIKR_CYCLE = ["سبحان الله", "الحمد لله", "الله أكبر"];
  const MASHA_ALLAH = "ما شاء الله";

  const scheme = environment.colorScheme ?? "light";
  const tok =
    scheme === "dark"
      ? { bg: "#0f0e0b", ink: "#f5ebdb", muted: "#f5ebdb94", accent: "#29603E" }
      : {
          bg: "#e8dcc4",
          ink: "#1a1408",
          muted: "#1a14088c",
          accent: "#29603E",
        };

  const count = props.dhikr.count;
  const target = Math.max(1, props.dhikr.target);
  const complete = count >= target;
  const cycleIndex =
    Math.max(0, Math.floor((count - 1) / target)) % DHIKR_CYCLE.length;
  const arabic = complete ? MASHA_ALLAH : DHIKR_CYCLE[cycleIndex];

  return (
    <Button target="increment">
      <VStack
        modifiers={[
          padding({ all: 12 }),
          frame({
            maxWidth: Number.POSITIVE_INFINITY,
            maxHeight: Number.POSITIVE_INFINITY,
          }),
          containerBackground(tok.bg, "widget"),
        ]}
        spacing={4}
      >
        <HStack modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}>
          <Spacer />
          <Text modifiers={[font({ size: 10 }), foregroundStyle(tok.muted)]}>
            {`${count}/${target}`}
          </Text>
        </HStack>

        <Gauge
          currentValueLabel={
            <Text
              modifiers={[
                font({ size: 28, weight: "bold" }),
                foregroundStyle(tok.ink),
              ]}
            >
              {`${count}`}
            </Text>
          }
          max={target}
          min={0}
          modifiers={[
            gaugeStyle("circular"),
            frame({ maxHeight: Number.POSITIVE_INFINITY }),
          ]}
          value={Math.min(count, target)}
        />

        <Text modifiers={[font({ size: 13 }), foregroundStyle(tok.ink)]}>
          {arabic}
        </Text>

        <HStack modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}>
          <Text modifiers={[font({ size: 9 }), foregroundStyle(tok.muted)]}>
            {`${props.dhikr.sessionTotal} today`}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 9, weight: "bold" }),
              foregroundStyle(tok.accent),
            ]}
          >
            {complete ? "Reset" : "+1"}
          </Text>
        </HStack>
      </VStack>
    </Button>
  );
}

export const dhikrWidget = createWidget<WidgetProps, DhikrConfig>(
  "DhikrWidget",
  DhikrLayout,
);

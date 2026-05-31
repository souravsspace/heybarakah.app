import {
  AccessoryWidgetBackground,
  Gauge,
  HStack,
  Spacer,
  Text,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import { font, gaugeStyle, kerning } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

function LockComplicationLayout(
  props: WidgetProps,
  environment: WidgetEnvironment,
) {
  "widget";

  const COUNTDOWN_WINDOW_MIN = 180;
  const state = props.salah;
  const pct = Math.max(
    0.04,
    Math.min(1, 1 - state.countdownMinutes / COUNTDOWN_WINDOW_MIN),
  );

  if (environment.widgetFamily === "accessoryCircular") {
    return (
      <ZStack>
        <AccessoryWidgetBackground />
        <Gauge
          currentValueLabel={
            <Text modifiers={[font({ size: 16 })]}>{state.display.letter}</Text>
          }
          max={1}
          min={0}
          modifiers={[gaugeStyle("circular")]}
          value={pct}
        />
      </ZStack>
    );
  }

  if (environment.widgetFamily === "accessoryRectangular") {
    return (
      <VStack alignment="leading" spacing={1}>
        <Text modifiers={[font({ size: 8, weight: "bold" }), kerning(1.8)]}>
          {state.isLocked ? "NOW" : "NEXT"}
        </Text>
        <Text modifiers={[font({ size: 19 })]}>{state.display.title}</Text>
        <Text modifiers={[font({ size: 9 })]}>
          {`${state.timeText} · ${state.countdownText}`}
        </Text>
      </VStack>
    );
  }

  return (
    <HStack spacing={4}>
      <Text>{`${state.display.title} in ${state.countdownText}`}</Text>
      <Spacer />
    </HStack>
  );
}

export const lockComplicationsWidget = createWidget<WidgetProps>(
  "LockComplications",
  LockComplicationLayout,
);

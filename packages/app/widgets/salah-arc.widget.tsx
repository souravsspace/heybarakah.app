import { Circle, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  italic,
  kerning,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import { derivePrayerState, hijriDateString } from "@/lib/widget-derive";
import type { WidgetSnapshot } from "@/lib/widgets-native";
import { asDirection, directionTokens } from "@/widgets/theme";

interface SalahArcConfig {
  style: string;
}

function SalahArcLayout(
  props: WidgetSnapshot,
  environment: WidgetEnvironment<SalahArcConfig>
) {
  "widget";

  const dir = asDirection(environment.configuration?.style, "editorial");
  const tok = directionTokens(dir, environment.colorScheme ?? "light");
  const now = environment.date.getTime();
  const state = derivePrayerState(props, now);
  const hijri = hijriDateString(now);

  return (
    <VStack
      alignment="leading"
      modifiers={[
        padding({ all: 14 }),
        frame({
          maxWidth: Number.POSITIVE_INFINITY,
          maxHeight: Number.POSITIVE_INFINITY,
        }),
        containerBackground(tok.bg, "widget"),
      ]}
      spacing={2}
    >
      <HStack
        alignment="top"
        modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
      >
        <Text
          modifiers={[
            font({ size: 9, weight: "bold" }),
            kerning(1.4),
            foregroundStyle(tok.accent),
          ]}
        >
          {state.isLocked ? "QUIET NOW" : "NEXT"}
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 18 }), foregroundStyle(tok.muted)]}>
          {state.display.arabic}
        </Text>
      </HStack>

      <HStack alignment="bottom" spacing={10}>
        <Text modifiers={[font({ size: 30 }), foregroundStyle(tok.ink)]}>
          {state.display.title}
        </Text>
        <Text
          modifiers={[font({ size: 16 }), italic(), foregroundStyle(tok.muted)]}
        >
          {state.isLocked
            ? `${state.countdownText} left`
            : `in ${state.countdownText}`}
        </Text>
      </HStack>

      <HStack modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}>
        <Text modifiers={[font({ size: 10 }), foregroundStyle(tok.muted)]}>
          {`${state.timeText} · Mecca`}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 9, weight: "bold" }),
            kerning(1.3),
            foregroundStyle(tok.muted),
          ]}
        >
          {hijri.toUpperCase()}
        </Text>
      </HStack>

      <Spacer minLength={0} />

      <HStack
        modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
        spacing={0}
      >
        {state.points.map((p) => (
          <VStack
            key={p.name}
            modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
            spacing={3}
          >
            <Circle
              modifiers={[
                frame({
                  width: p.isCurrent ? 9 : 6,
                  height: p.isCurrent ? 9 : 6,
                }),
                foregroundStyle(
                  p.isCurrent ? tok.accent : p.isPast ? tok.muted : tok.hairline
                ),
              ]}
            />
            <Text modifiers={[font({ size: 8 }), foregroundStyle(tok.muted)]}>
              {p.info.letter}
            </Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  );
}

export const salahArcWidget = createWidget<WidgetSnapshot, SalahArcConfig>(
  "SalahArcWidget",
  SalahArcLayout
);

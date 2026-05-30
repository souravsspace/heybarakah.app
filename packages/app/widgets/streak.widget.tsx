import {
  Circle,
  HStack,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  kerning,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetSnapshot } from "@/lib/widgets-native";
import { asDirection, directionTokens } from "@/widgets/theme";

interface StreakConfig {
  style: string;
}

const HISTORY_DAYS = 14;
const PRAYER_SLOTS = 5;

function StreakLayout(
  props: WidgetSnapshot,
  environment: WidgetEnvironment<StreakConfig>
) {
  "widget";

  const dir = asDirection(environment.configuration?.style, "editorial");
  const tok = directionTokens(dir, environment.colorScheme ?? "light");
  const s = props.streak;
  const history = s.history.slice(-HISTORY_DAYS);

  return (
    <VStack
      alignment="leading"
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
        <Text
          modifiers={[
            font({ size: 9, weight: "bold" }),
            kerning(1.2),
            foregroundStyle(tok.muted),
          ]}
        >
          {`BEST ${s.best}`}
        </Text>
      </HStack>

      <HStack alignment="bottom" spacing={6}>
        <Text
          modifiers={[
            font({ size: 56, weight: "bold" }),
            foregroundStyle(tok.ink),
          ]}
        >
          {`${s.days}`}
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(tok.muted)]}>
          days
        </Text>
      </HStack>

      <Spacer minLength={0} />

      <HStack
        alignment="bottom"
        modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY, height: 16 })]}
        spacing={2}
      >
        {history.map((h, i) => (
          <RoundedRectangle
            cornerRadius={1}
            key={`${i}-${h}`}
            modifiers={[
              frame({
                maxWidth: Number.POSITIVE_INFINITY,
                height: h === 1 ? 14 : 3,
              }),
              foregroundStyle(h === 1 ? tok.accent : tok.hairline),
            ]}
          />
        ))}
      </HStack>

      <HStack spacing={6}>
        {Array.from({ length: PRAYER_SLOTS }, (_, i) => (
          <Circle
            key={i}
            modifiers={[
              frame({ width: 7, height: 7 }),
              foregroundStyle(i < s.todayDone ? tok.accent : tok.hairline),
            ]}
          />
        ))}
        <Spacer />
      </HStack>
    </VStack>
  );
}

export const streakWidget = createWidget<WidgetSnapshot, StreakConfig>(
  "StreakWidget",
  StreakLayout
);

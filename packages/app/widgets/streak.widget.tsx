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
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

interface StreakConfig {
  style: string;
}

function StreakLayout(
  props: WidgetProps,
  environment: WidgetEnvironment<StreakConfig>
) {
  "widget";

  const HISTORY_DAYS = 14;
  const PRAYER_SLOTS = 5;

  const scheme = environment.colorScheme ?? "light";
  // Home-screen appearance: Light/Dark give "fullColor", while Tinted and Clear
  // give "accented"/"vibrant". In those modes WidgetKit recolours the tile from
  // the user's tint, so an opaque brand background fights it and the widget
  // reads as a solid slab instead of taking the system look. Go transparent and
  // switch to luminance-only greys — WidgetKit maps brightness onto the tint,
  // so white becomes the full-strength colour and the alphas become its
  // secondary shades.
  const mode = environment.widgetRenderingMode ?? "fullColor";
  const systemTinted = mode !== "fullColor";
  const dark = {
    bg: "#0f0e0b",
    ink: "#f5ebdb",
    muted: "#f5ebdb94",
    accent: "#29603E",
    hairline: "#f5ebdb2e",
  };
  const light = {
    bg: "#e8dcc4",
    ink: "#1a1408",
    muted: "#1a14088c",
    accent: "#29603E",
    hairline: "#1a140829",
  };
  const tinted = {
    // Fully transparent container so the system's tinted/clear material shows.
    bg: "#00000000",
    ink: "#ffffff",
    muted: "#ffffffb3",
    accent: "#ffffff",
    hairline: "#ffffff4d",
  };
  let tok = light;
  if (systemTinted) {
    tok = tinted;
  } else if (scheme === "dark") {
    tok = dark;
  }
  const s = props.streak ?? {
    best: 0,
    days: 0,
    history: [],
    todayDone: 0,
  };
  const history = (Array.isArray(s.history) ? s.history : []).slice(
    -HISTORY_DAYS
  );

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
        widgetURL("barakah://progress"),
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

export const streakWidget = createWidget<WidgetProps, StreakConfig>(
  "StreakWidget",
  StreakLayout
);

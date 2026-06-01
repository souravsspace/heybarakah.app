import {
  Button,
  HStack,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  kerning,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

interface DhikrConfig {
  style: string;
}

/** Stable interaction target — matched by `addUserInteractionListener`. */
export const DHIKR_INCREMENT_TARGET = "increment";

const FILL = Number.POSITIVE_INFINITY;
// systemSmall inner content width after padding(14)*2; kept conservative so the
// fixed-width progress rail never overflows the tile.
const RAIL_WIDTH = 118;

function DhikrLayout(
  props: WidgetProps,
  environment: WidgetEnvironment<DhikrConfig>
) {
  "widget";

  const DHIKR_CYCLE = ["سبحان الله", "الحمد لله", "الله أكبر"];
  const MASHA_ALLAH = "ما شاء الله";

  const scheme = environment.colorScheme ?? "light";
  const tok =
    scheme === "dark"
      ? {
          bg: "#0f0e0b",
          ink: "#f5ebdb",
          muted: "#f5ebdb94",
          accent: "#29603E",
          hairline: "#f5ebdb2e",
        }
      : {
          bg: "#e8dcc4",
          ink: "#1a1408",
          muted: "#1a14088c",
          accent: "#29603E",
          hairline: "#1a140829",
        };

  const d = props.dhikr ?? { count: 0, sessionTotal: 0, target: 33 };
  const count = Number.isFinite(d.count) ? d.count : 0;
  const target = Math.max(1, Number.isFinite(d.target) ? d.target : 33);
  const sessionTotal = Number.isFinite(d.sessionTotal) ? d.sessionTotal : 0;
  const complete = count >= target;
  const cycleIndex =
    Math.max(0, Math.floor((count - 1) / target)) % DHIKR_CYCLE.length;
  const arabic = complete ? MASHA_ALLAH : DHIKR_CYCLE[cycleIndex];
  const progress = Math.min(1, count / target);
  const filledWidth = Math.round(progress * RAIL_WIDTH);
  const restWidth = RAIL_WIDTH - filledWidth;

  return (
    // The interactive Button is the ROOT and owns `containerBackground` +
    // `buttonStyle("plain")`. Wrapping the Button in a VStack that holds the
    // background hides containerBackground from WidgetKit ("The widget
    // background view is missing" on every entry → placeholder on dark, white
    // on tinted), because the background-detection pass does not traverse the
    // interactive Button subtree; the default button style also fills white in
    // tinted render mode. Apple's interactive-widget pattern applies
    // containerBackground to the Button itself. Only primitives/modifiers
    // proven by the other rendering widgets are used inside.
    <Button
      modifiers={[
        buttonStyle("plain"),
        frame({ maxWidth: FILL, maxHeight: FILL }),
        containerBackground(tok.bg, "widget"),
      ]}
      target="increment"
    >
      <VStack
        alignment="leading"
        modifiers={[
          padding({ all: 14 }),
          frame({ maxWidth: FILL, maxHeight: FILL }),
        ]}
        spacing={6}
      >
        <HStack modifiers={[frame({ maxWidth: FILL })]}>
          <Text
            modifiers={[
              font({ size: 9, weight: "bold" }),
              kerning(1.3),
              foregroundStyle(tok.accent),
            ]}
          >
            {complete ? "COMPLETE" : "DHIKR"}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 10 }), foregroundStyle(tok.muted)]}>
            {`${count}/${target}`}
          </Text>
        </HStack>

        <Spacer minLength={0} />

        <Text
          modifiers={[
            font({ size: complete ? 30 : 46, weight: "bold" }),
            foregroundStyle(tok.ink),
          ]}
        >
          {complete ? "Mashā Allāh" : `${count}`}
        </Text>
        <Text modifiers={[font({ size: 17 }), foregroundStyle(tok.ink)]}>
          {arabic}
        </Text>

        <Spacer minLength={0} />

        <HStack spacing={0}>
          <RoundedRectangle
            cornerRadius={2}
            modifiers={[
              frame({ width: filledWidth, height: 4 }),
              foregroundStyle(tok.accent),
            ]}
          />
          <RoundedRectangle
            cornerRadius={2}
            modifiers={[
              frame({ width: restWidth, height: 4 }),
              foregroundStyle(tok.hairline),
            ]}
          />
        </HStack>

        <HStack modifiers={[frame({ maxWidth: FILL })]}>
          <Text modifiers={[font({ size: 9 }), foregroundStyle(tok.muted)]}>
            {`${sessionTotal} today`}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 10, weight: "bold" }),
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
  DhikrLayout
);

import {
  Button,
  HStack,
  ProgressView,
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
  progressViewStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

interface DhikrConfig {
  style: string;
}

/** Stable interaction target — matched by `addUserInteractionListener`. */
export const DHIKR_INCREMENT_TARGET = "increment";

const FILL = Number.POSITIVE_INFINITY;

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
        }
      : {
          bg: "#e8dcc4",
          ink: "#1a1408",
          muted: "#1a14088c",
          accent: "#29603E",
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

  return (
    // Root must own `containerBackground` + fill with the interactive Button
    // nested inside — a Button root with the background on a child returns an
    // empty view collection (CHSErrorDomain 1101) and WidgetKit shows the
    // placeholder. Do not invert this nesting.
    <VStack
      modifiers={[
        frame({ maxWidth: FILL, maxHeight: FILL }),
        containerBackground(tok.bg, "widget"),
      ]}
    >
      <Button target="increment">
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
              font({
                size: complete ? 30 : 44,
                weight: "bold",
                design: "serif",
              }),
              foregroundStyle(tok.ink),
            ]}
          >
            {complete ? "Mashā Allāh" : `${count}`}
          </Text>
          <Text modifiers={[font({ size: 17 }), foregroundStyle(tok.ink)]}>
            {arabic}
          </Text>

          <Spacer minLength={0} />

          <ProgressView
            modifiers={[
              progressViewStyle("linear"),
              tint(tok.accent),
              frame({ maxWidth: FILL }),
            ]}
            value={progress}
          />

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
    </VStack>
  );
}

export const dhikrWidget = createWidget<WidgetProps, DhikrConfig>(
  "DhikrWidget",
  DhikrLayout
);

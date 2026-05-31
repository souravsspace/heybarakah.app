import {
  Divider,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  italic,
  kerning,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

interface AyahConfig {
  style: string;
}

function AyahLayout(
  props: WidgetProps,
  environment: WidgetEnvironment<AyahConfig>,
) {
  "widget";

  const scheme = environment.colorScheme ?? "light";
  const tok =
    scheme === "dark"
      ? { bg: "#0b0e0c", ink: "#f5ebdb", muted: "#f5ebdb94", accent: "#29603E" }
      : {
          bg: "#f3d8c0",
          ink: "#2a1c10",
          muted: "#2a1c1094",
          accent: "#29603E",
        };
  const a = props.ayah ?? {
    arabic: "",
    reference: "",
    surah: "",
    translation: "",
  };
  const ref = a.reference ? a.reference.replace(":", " : ") : "";

  return (
    <VStack
      alignment="leading"
      modifiers={[
        padding({ all: 16 }),
        frame({
          maxWidth: Number.POSITIVE_INFINITY,
          maxHeight: Number.POSITIVE_INFINITY,
        }),
        containerBackground(tok.bg, "widget"),
      ]}
      spacing={12}
    >
      <HStack modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}>
        <Text
          modifiers={[
            font({ size: 10, weight: "bold" }),
            kerning(1.4),
            foregroundStyle(tok.accent),
          ]}
        >
          AYAH OF THE DAY
        </Text>
        <Spacer />
        <Image color={tok.accent} size={14} systemName="play.circle" />
      </HStack>

      <Text
        modifiers={[
          font({ size: 24 }),
          foregroundStyle(tok.ink),
          multilineTextAlignment("trailing"),
        ]}
      >
        {a.arabic}
      </Text>

      <Divider />

      <Text
        modifiers={[font({ size: 14 }), italic(), foregroundStyle(tok.ink)]}
      >
        {`“${a.translation}”`}
      </Text>

      <Spacer minLength={0} />

      <HStack modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}>
        <Text
          modifiers={[
            font({ size: 10, weight: "bold" }),
            kerning(1.4),
            foregroundStyle(tok.accent),
          ]}
        >
          {a.surah.toUpperCase()}
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 10 }), foregroundStyle(tok.muted)]}>
          {ref}
        </Text>
      </HStack>
    </VStack>
  );
}

export const ayahWidget = createWidget<WidgetProps, AyahConfig>(
  "AyahWidget",
  AyahLayout,
);

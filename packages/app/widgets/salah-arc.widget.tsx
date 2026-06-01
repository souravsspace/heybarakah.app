import {
  Circle,
  HStack,
  Image,
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
  italic,
  kerning,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";

interface SalahArcConfig {
  style: string;
}

function SalahArcLayout(
  props: WidgetProps,
  environment: WidgetEnvironment<SalahArcConfig>
) {
  "widget";

  // Everything the layout references lives INSIDE this function: the
  // expo-widgets babel plugin stringifies only the body, so any module-scope
  // reference would be undefined in the widget JS runtime and the render would
  // throw (no containerBackground → placeholder tile). Only primitives proven
  // on device are used (Text/Circle/RoundedRectangle/Image/HStack/VStack/Spacer
  // + font/foregroundStyle/frame/kerning/padding/italic/containerBackground);
  // no Path/Gauge/gradient. Image(systemName) is an SF Symbol, proven on device.
  const FILL = Number.POSITIVE_INFINITY;
  // Vertical travel of the day-arc; dots near dawn/night sink toward the
  // horizon, midday peaks. The dots ride above a hairline horizon so the row
  // reads as the sun's daily passage the five prayers are tied to.
  const ARC_RISE = 16;

  const scheme = environment.colorScheme ?? "light";
  const tok =
    scheme === "dark"
      ? {
          bg: "#0f0e0b",
          ink: "#f5ebdb",
          muted: "#f5ebdb94",
          faint: "#f5ebdb5c",
          accent: "#29603E",
          hairline: "#f5ebdb2e",
        }
      : {
          bg: "#e8dcc4",
          ink: "#1a1408",
          muted: "#1a14088c",
          faint: "#1a14085c",
          accent: "#29603E",
          hairline: "#1a140829",
        };

  const state = props.salah ?? {
    countdownMinutes: 0,
    countdownText: "",
    display: { arabic: "", letter: "", name: "fajr" as const, title: "" },
    isActive: false,
    isLocked: false,
    nextTitle: "",
    points: [],
    timeText: "",
  };
  const hijri = typeof props.hijri === "string" ? props.hijri : "";
  const points = Array.isArray(state.points) ? state.points : [];
  const title = state.display.title || "Salah";
  const arabic = state.display.arabic || title;
  const countdown = state.countdownText || "now";
  const timeText = state.timeText || "--:--";

  // Sentence-case, reverent labels mirroring the home screen's heroLabel.
  const label = state.isLocked
    ? "Quiet hours"
    : state.isActive
      ? "In progress"
      : "Next prayer";
  const labelColor = state.isActive || state.isLocked ? tok.accent : tok.muted;
  const countLabel = state.isActive ? "left" : "until";

  // Celestial body for the current prayer: a crescent through the dark
  // prayers (fajr/maghrib/isha) and the sun through the day (dhuhr/asr).
  const dn = state.display.name;
  const isNight = dn === "fajr" || dn === "maghrib" || dn === "isha";
  const celestial = isNight ? "moon.stars.fill" : "sun.max.fill";

  return (
    <VStack
      alignment="leading"
      modifiers={[
        padding({ all: 14 }),
        frame({ maxWidth: FILL, maxHeight: FILL }),
        containerBackground(tok.bg, "widget"),
      ]}
      spacing={0}
    >
      <HStack modifiers={[frame({ maxWidth: FILL })]}>
        <Text
          modifiers={[
            font({ size: 12, weight: "semibold" }),
            foregroundStyle(labelColor),
          ]}
        >
          {label}
        </Text>
        <Spacer />
        <HStack spacing={6}>
          <Text
            modifiers={[
              font({ size: 9, weight: "bold" }),
              kerning(1.4),
              foregroundStyle(tok.faint),
            ]}
          >
            {hijri.toUpperCase()}
          </Text>
          <Image color={tok.accent} size={13} systemName={celestial} />
        </HStack>
      </HStack>

      <Spacer minLength={0} />

      {/* Arabic name leads (honoring the language); English + adhan read under
          it. Countdown is the glance value on the trailing edge. */}
      <HStack alignment="bottom" modifiers={[frame({ maxWidth: FILL })]}>
        <VStack alignment="leading" spacing={2}>
          <Text
            modifiers={[
              font({ size: 32, weight: "bold" }),
              foregroundStyle(tok.ink),
            ]}
          >
            {arabic}
          </Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(tok.muted)]}>
            {`${title} · adhan ${timeText}`}
          </Text>
        </VStack>
        <Spacer />
        <VStack alignment="trailing" spacing={0}>
          <Text
            modifiers={[
              font({ size: 24, weight: "bold" }),
              foregroundStyle(tok.ink),
            ]}
          >
            {countdown}
          </Text>
          <Text
            modifiers={[
              font({ size: 10 }),
              italic(),
              foregroundStyle(tok.muted),
            ]}
          >
            {countLabel}
          </Text>
        </VStack>
      </HStack>

      <Spacer minLength={0} />

      <HStack
        alignment="top"
        modifiers={[frame({ maxWidth: FILL })]}
        spacing={0}
      >
        {points.map((p) => {
          const pct = Number.isFinite(p.pct)
            ? Math.max(0, Math.min(1, p.pct))
            : 0;
          const rise = Math.round(ARC_RISE * (1 - Math.sin(pct * Math.PI)));
          const size = p.isCurrent ? 11 : 7;
          const color = p.isCurrent
            ? tok.accent
            : p.isPast
              ? tok.muted
              : tok.hairline;
          return (
            <VStack
              key={p.name}
              modifiers={[frame({ maxWidth: FILL })]}
              spacing={0}
            >
              <Circle
                modifiers={[
                  frame({ width: size, height: size }),
                  foregroundStyle(color),
                  padding({ top: rise }),
                ]}
              />
            </VStack>
          );
        })}
      </HStack>

      {/* Horizon line the day-arc rides over. */}
      <RoundedRectangle
        cornerRadius={1}
        modifiers={[
          frame({ maxWidth: FILL, height: 1 }),
          foregroundStyle(tok.hairline),
          padding({ top: 6 }),
        ]}
      />

      <HStack
        modifiers={[frame({ maxWidth: FILL }), padding({ top: 5 })]}
        spacing={0}
      >
        {points.map((p) => (
          <VStack
            key={p.name}
            modifiers={[frame({ maxWidth: FILL })]}
            spacing={0}
          >
            <Text
              modifiers={[
                p.isCurrent
                  ? font({ size: 9, weight: "bold" })
                  : font({ size: 9 }),
                foregroundStyle(p.isCurrent ? tok.ink : tok.muted),
              ]}
            >
              {p.info.letter}
            </Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  );
}

export const salahArcWidget = createWidget<WidgetProps, SalahArcConfig>(
  "SalahArcWidget",
  SalahArcLayout
);

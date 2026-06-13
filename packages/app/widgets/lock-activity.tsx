import {
  HStack,
  Image,
  ProgressView,
  Rectangle,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  aspectRatio,
  font,
  foregroundStyle,
  frame,
  kerning,
  monospacedDigit,
  padding,
  progressViewStyle,
  resizable,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import {
  createLiveActivity,
  type LiveActivity,
  type LiveActivityEnvironment,
} from "expo-widgets";
import type { PrayerName } from "@/lib/widgets-native";

export interface LockActivityProps {
  endEpoch: number;
  prayerName: PrayerName;
  startEpoch: number;
}

function LockActivityLayout(
  props: LockActivityProps,
  _environment: LiveActivityEnvironment
) {
  "widget";

  // The `expo-widgets` babel transform stringifies this body with no closure or
  // imports, so every identifier must be declared inside the function. The mark
  // is baked in as a base64 `data:` URI: `@expo/ui`'s ImageView loads `uiImage`
  // via `Data(contentsOf:)`, which decodes a data URL inline. No app-group file
  // means no extension file-protection read failure (the cause of the missing
  // icon) and no SF Symbol limitation, so the glyph always renders.
  const CREAM = "#f5ebdb";
  const CREAM_DIM = "#b9ad92";
  const GREEN = "#29603e";
  // A lighter mosque green that stays legible as a bare accent on the black
  // Dynamic Island pill, where the deep brand green reads as near-black.
  const GREEN_LIGHT = "#5aa178";
  // Cream at ~35% for the hairline divider on the glass banner (8-digit hex).
  const HAIRLINE = "#b9ad9259";
  const ICON =
    "data:image/png;base64,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";
  const CATALOG = {
    fajr: { title: "Fajr" },
    dhuhr: { title: "Dhuhr" },
    asr: { title: "Asr" },
    maghrib: { title: "Maghrib" },
    isha: { title: "Isha" },
  };

  const prayer = CATALOG[props.prayerName] ?? CATALOG.fajr;
  const end = new Date(props.endEpoch);

  // The cream aliwangwang mark. Square; sized per surface.
  const mark = (size: number) => (
    <Image
      modifiers={[
        resizable(),
        aspectRatio({ contentMode: "fit" }),
        frame({ width: size, height: size }),
      ]}
      uiImage={ICON}
    />
  );

  // The mark seated on a mosque-green tile. Even if the tile shape ever fails to
  // render on the activity surface, the cream mark still reads on the dark base.
  const markTile = (tile: number, glyph: number) => (
    <ZStack modifiers={[frame({ width: tile, height: tile })]}>
      <RoundedRectangle
        cornerRadius={tile * 0.29}
        modifiers={[
          frame({ width: tile, height: tile }),
          foregroundStyle(GREEN),
        ]}
      />
      {mark(glyph)}
    </ZStack>
  );

  const timer = (size: number, width?: number) => (
    <Text
      date={end}
      dateStyle="timer"
      modifiers={[
        font({ size, weight: "semibold" }),
        monospacedDigit(),
        foregroundStyle(CREAM),
        ...(width ? [frame({ width, alignment: "trailing" })] : []),
      ]}
    />
  );

  const eyebrow = (
    <Text
      modifiers={[
        font({ size: 8, weight: "bold" }),
        kerning(1.8),
        foregroundStyle(CREAM_DIM),
      ]}
    >
      QUIET HOURS
    </Text>
  );

  const metaLabel = (label: string) => (
    <Text
      modifiers={[
        font({ size: 8, weight: "bold" }),
        kerning(1.6),
        foregroundStyle(CREAM_DIM),
      ]}
    >
      {label}
    </Text>
  );

  // A slim mosque-green countdown bar that empties as the quiet-hours window
  // runs out. ActivityKit drives the fill from the timer interval, so it stays
  // live without push updates. Green is the only accent, used as a signal.
  const bar = (width?: number) => (
    <ProgressView
      countsDown={true}
      modifiers={[
        progressViewStyle("linear"),
        tint(GREEN),
        ...(width ? [frame({ width })] : []),
      ]}
      timerInterval={{ lower: new Date(props.startEpoch), upper: end }}
    />
  );

  const title = (size: number) => (
    <Text
      modifiers={[
        font({ size, weight: "semibold", design: "serif" }),
        foregroundStyle(CREAM),
      ]}
    >
      {prayer.title}
    </Text>
  );

  return {
    // Lock-screen banner: no opaque fill. On iOS 26 ActivityKit applies its
    // Liquid Glass material to the banner surface itself (frosted, wallpaper
    // aware) as long as we don't paint over it — cream reads on the system's
    // dark vibrant glass, the mosque-green tile anchors the brand, and a
    // hairline divider gives structure without a card.
    banner: (
      <HStack
        modifiers={[
          padding({ horizontal: 16, vertical: 12 }),
          frame({ maxWidth: Number.POSITIVE_INFINITY }),
        ]}
        spacing={12}
      >
        {markTile(40, 23)}
        <Rectangle
          modifiers={[
            frame({ width: 1, height: 34 }),
            foregroundStyle(HAIRLINE),
          ]}
        />
        <VStack alignment="leading" spacing={6}>
          {title(21)}
          {bar(128)}
        </VStack>
        <Spacer />
        <VStack alignment="trailing" spacing={2}>
          {metaLabel("ENDS IN")}
          {timer(22)}
        </VStack>
      </HStack>
    ),
    compactLeading: (
      <HStack spacing={5}>
        {mark(16)}
        {title(14)}
      </HStack>
    ),
    compactTrailing: (
      <Text
        date={end}
        dateStyle="timer"
        modifiers={[
          font({ size: 14, weight: "medium" }),
          monospacedDigit(),
          foregroundStyle(GREEN_LIGHT),
          frame({ width: 44, alignment: "trailing" }),
        ]}
      />
    ),
    minimal: mark(15),
    expandedLeading: markTile(34, 20),
    expandedCenter: (
      <VStack spacing={2}>
        {title(19)}
        {eyebrow}
      </VStack>
    ),
    expandedTrailing: (
      <VStack alignment="trailing" spacing={2}>
        {timer(22)}
        {metaLabel("REMAINING")}
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ horizontal: 6, top: 4 })]}>{bar()}</VStack>
    ),
  };
}

/** Must match the Live Activity `name` in the `expo-widgets` app config. */
export const LOCK_ACTIVITY_NAME = "LockNow";

const lockActivityFactory = createLiveActivity<LockActivityProps>(
  LOCK_ACTIVITY_NAME,
  LockActivityLayout
);

// The old native bridge returned an opaque id used to end a specific activity.
// The official API hands back `LiveActivity` instances instead, so we keep a
// synthetic-id → instance map to preserve `widgets-native.ts`'s signatures.
const activities = new Map<string, LiveActivity<LockActivityProps>>();

export function startLockActivityInstance(args: {
  endISO: string;
  name: PrayerName;
  startISO: string;
}): string {
  const startEpoch = Date.parse(args.startISO);
  const endEpoch = Date.parse(args.endISO);
  // Reject malformed/empty ISO strings before they reach native as NaN, which
  // the Swift bridge would coerce to a bogus epoch and break the countdown.
  if (!(Number.isFinite(startEpoch) && Number.isFinite(endEpoch))) {
    throw new Error(
      `startLockActivityInstance: invalid ISO (start="${args.startISO}", end="${args.endISO}")`
    );
  }
  const id = `${args.name}:${Date.now()}`;
  const activity = lockActivityFactory.start({
    prayerName: args.name,
    startEpoch,
    endEpoch,
  });
  activities.set(id, activity);
  return id;
}

export async function endLockActivityInstance(id: string): Promise<void> {
  const activity = activities.get(id);
  activities.delete(id);
  if (activity) {
    await activity.end("immediate");
  }
}

export async function endAllLockActivityInstances(): Promise<void> {
  activities.clear();
  await Promise.all(
    lockActivityFactory.getInstances().map((a) => a.end("immediate"))
  );
}

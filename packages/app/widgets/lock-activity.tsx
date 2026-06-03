import { HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  aspectRatio,
  background,
  font,
  foregroundStyle,
  frame,
  kerning,
  padding,
  resizable,
} from "@expo/ui/swift-ui/modifiers";
import {
  createLiveActivity,
  type LiveActivity,
  type LiveActivityEnvironment,
} from "expo-widgets";
import type { PrayerName } from "@/lib/widgets-native";

export interface LockActivityProps {
  endEpoch: number;
  /**
   * `file://` uri of the cream Barakah mark in the widget app-group container.
   * Empty string falls back to the SF Symbol moon (the extension can't load the
   * mark before the app has copied it into the shared container).
   */
  iconUri: string;
  prayerName: PrayerName;
  startEpoch: number;
}

function LockActivityLayout(
  props: LockActivityProps,
  _environment: LiveActivityEnvironment
) {
  "widget";

  // Inlined: the `expo-widgets` babel transform stringifies this widget body
  // with no closure or imports, so module-scope refs would be undefined inside
  // the widget JS runtime and the render would throw.
  const CREAM = "#f5ebdb";
  const CREAM_DIM = "#d8cbb3";
  const WHITE = "#ffffff";
  const GREEN = "#29603e";
  const CATALOG = {
    fajr: { title: "Fajr" },
    dhuhr: { title: "Dhuhr" },
    asr: { title: "Asr" },
    maghrib: { title: "Maghrib" },
    isha: { title: "Isha" },
  };

  const prayer = CATALOG[props.prayerName] ?? CATALOG.fajr;
  const end = new Date(props.endEpoch);

  // The Barakah mark is a tall glyph (~0.62 w/h). Sized per surface; the moon
  // is the fallback when the mark uri isn't staged yet.
  const markIcon = (w: number, h: number, moonSize: number) =>
    props.iconUri ? (
      <Image
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fit" }),
          frame({ width: w, height: h }),
        ]}
        uiImage={props.iconUri}
      />
    ) : (
      <Image color={CREAM} size={moonSize} systemName="moon.stars.fill" />
    );

  return {
    // Lock-screen banner. Solid mosque green per the Barakah brand (no glass:
    // SwiftUI's glassEffect renders clear/transparent on the ActivityKit
    // lock-screen surface, which read as a blank banner).
    banner: (
      <HStack
        modifiers={[
          padding({ horizontal: 16, vertical: 14 }),
          frame({ maxWidth: Number.POSITIVE_INFINITY }),
          background(GREEN),
        ]}
        spacing={13}
      >
        {markIcon(15, 24, 20)}
        <VStack alignment="leading" spacing={2}>
          <Text
            modifiers={[
              font({ size: 9, weight: "bold" }),
              kerning(2),
              foregroundStyle(CREAM_DIM),
            ]}
          >
            QUIET NOW
          </Text>
          <Text
            modifiers={[
              font({ size: 20, weight: "semibold", design: "serif" }),
              foregroundStyle(WHITE),
            ]}
          >
            {prayer.title}
          </Text>
        </VStack>
        <Spacer />
        <Text
          date={end}
          dateStyle="timer"
          modifiers={[
            font({ size: 22, weight: "medium" }),
            foregroundStyle(WHITE),
          ]}
        />
      </HStack>
    ),
    // Compact island: clamp the timer width so the countdown can't reserve the
    // wide fixed slot that was pushing the wifi / cellular status icons off.
    compactLeading: markIcon(11, 17, 15),
    compactTrailing: (
      <Text
        date={end}
        dateStyle="timer"
        modifiers={[
          font({ size: 13, weight: "medium" }),
          foregroundStyle(CREAM),
          frame({ width: 44, alignment: "trailing" }),
        ]}
      />
    ),
    minimal: markIcon(11, 17, 15),
    expandedLeading: (
      <HStack spacing={8}>
        {markIcon(13, 20, 18)}
        <Text
          modifiers={[
            font({ size: 17, weight: "semibold", design: "serif" }),
            foregroundStyle(WHITE),
          ]}
        >
          {prayer.title}
        </Text>
      </HStack>
    ),
    expandedTrailing: (
      <Text
        date={end}
        dateStyle="timer"
        modifiers={[
          font({ size: 17, weight: "medium" }),
          foregroundStyle(CREAM),
          frame({ alignment: "trailing" }),
        ]}
      />
    ),
    expandedCenter: (
      <Text
        modifiers={[
          font({ size: 9, weight: "bold" }),
          kerning(2),
          foregroundStyle(CREAM_DIM),
        ]}
      >
        QUIET NOW
      </Text>
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
  iconUri?: string;
  name: PrayerName;
  startISO: string;
}): string {
  const id = `${args.name}:${Date.now()}`;
  const activity = lockActivityFactory.start({
    prayerName: args.name,
    startEpoch: Date.parse(args.startISO),
    endEpoch: Date.parse(args.endISO),
    iconUri: args.iconUri ?? "",
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

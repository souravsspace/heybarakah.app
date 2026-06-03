import { HStack, Image, Spacer, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  aspectRatio,
  background,
  clipShape,
  font,
  foregroundStyle,
  frame,
  glassEffect,
  kerning,
  monospacedDigit,
  opacity,
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
  const WHITE = "#ffffff";
  const GREEN = "#29603E";
  const GREEN_DEEP = "#1f4a2f";
  const CATALOG = {
    fajr: { title: "Fajr", arabic: "الفجر" },
    dhuhr: { title: "Dhuhr", arabic: "الظهر" },
    asr: { title: "Asr", arabic: "العصر" },
    maghrib: { title: "Maghrib", arabic: "المغرب" },
    isha: { title: "Isha", arabic: "العشاء" },
  };

  const prayer = CATALOG[props.prayerName] ?? CATALOG.fajr;
  const end = new Date(props.endEpoch);

  const span = { lower: new Date(props.startEpoch), upper: end };

  return {
    // Lock-screen banner. Solid green is the base so the surface never renders
    // transparent (wallpaper bleed) on iOS < 26; the Liquid Glass tint layers on
    // top where supported for the premium translucent look.
    banner: (
      <HStack
        modifiers={[
          padding({ horizontal: 16, vertical: 13 }),
          frame({ maxWidth: Number.POSITIVE_INFINITY }),
          background(GREEN),
          clipShape("roundedRectangle", 26),
          glassEffect({
            glass: { variant: "regular", tint: GREEN },
            shape: "roundedRectangle",
            cornerRadius: 26,
          }),
        ]}
        spacing={14}
      >
        <ZStack
          modifiers={[
            frame({ width: 40, height: 40 }),
            background(GREEN_DEEP),
            clipShape("circle"),
          ]}
        >
          {props.iconUri ? (
            <Image
              modifiers={[
                resizable(),
                aspectRatio({ contentMode: "fit" }),
                frame({ width: 15, height: 23 }),
              ]}
              uiImage={props.iconUri}
            />
          ) : (
            <Image color={CREAM} size={19} systemName="moon.stars.fill" />
          )}
        </ZStack>
        <VStack alignment="leading" spacing={2}>
          <Text
            modifiers={[
              font({ size: 9, weight: "bold" }),
              kerning(2),
              foregroundStyle(CREAM),
              opacity(0.85),
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
        <VStack alignment="trailing" spacing={0}>
          <Text
            countsDown={true}
            modifiers={[
              font({ size: 23, weight: "medium" }),
              monospacedDigit(),
              foregroundStyle(WHITE),
            ]}
            timerInterval={span}
          />
          <Text
            modifiers={[
              font({ size: 9, weight: "medium" }),
              kerning(1.2),
              foregroundStyle(CREAM),
              opacity(0.7),
            ]}
          >
            LEFT
          </Text>
        </VStack>
      </HStack>
    ),
    // Compact island: clamp the timer width so the countdown can't reserve the
    // wide fixed slot that was pushing the wifi / cellular status icons off.
    compactLeading: props.iconUri ? (
      <Image
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fit" }),
          frame({ width: 11, height: 17 }),
        ]}
        uiImage={props.iconUri}
      />
    ) : (
      <Image color={CREAM} size={15} systemName="moon.stars.fill" />
    ),
    compactTrailing: (
      <Text
        countsDown={true}
        modifiers={[
          font({ size: 13, weight: "medium" }),
          monospacedDigit(),
          foregroundStyle(CREAM),
          frame({ width: 46, alignment: "trailing" }),
        ]}
        timerInterval={span}
      />
    ),
    minimal: props.iconUri ? (
      <Image
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fit" }),
          frame({ width: 11, height: 17 }),
        ]}
        uiImage={props.iconUri}
      />
    ) : (
      <Image color={CREAM} size={15} systemName="moon.stars.fill" />
    ),
    expandedLeading: (
      <HStack spacing={8}>
        {props.iconUri ? (
          <Image
            modifiers={[
              resizable(),
              aspectRatio({ contentMode: "fit" }),
              frame({ width: 13, height: 20 }),
            ]}
            uiImage={props.iconUri}
          />
        ) : (
          <Image color={CREAM} size={18} systemName="moon.stars.fill" />
        )}
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
        countsDown={true}
        modifiers={[
          font({ size: 17, weight: "medium" }),
          monospacedDigit(),
          foregroundStyle(CREAM),
          frame({ alignment: "trailing" }),
        ]}
        timerInterval={span}
      />
    ),
    expandedCenter: (
      <Text
        modifiers={[
          font({ size: 9, weight: "bold" }),
          kerning(2),
          foregroundStyle(CREAM),
          opacity(0.8),
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

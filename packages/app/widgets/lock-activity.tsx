import { HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  frame,
  kerning,
  monospacedDigit,
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

  // Inlined: the `expo-widgets` babel transform stringifies this widget body
  // with no closure or imports, so module-scope refs would be undefined inside
  // the widget JS runtime and the render would throw.
  const CREAM = "#f5ebdb";
  const WHITE = "#ffffff";
  const CATALOG = {
    fajr: { title: "Fajr", arabic: "الفجر" },
    dhuhr: { title: "Dhuhr", arabic: "الظهر" },
    asr: { title: "Asr", arabic: "العصر" },
    maghrib: { title: "Maghrib", arabic: "المغرب" },
    isha: { title: "Isha", arabic: "العشاء" },
  };

  const prayer = CATALOG[props.prayerName] ?? CATALOG.fajr;
  const end = new Date(props.endEpoch);

  return {
    banner: (
      <HStack
        modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
        spacing={12}
      >
        <Image color={CREAM} size={18} systemName="moon.stars.fill" />
        <VStack alignment="leading" spacing={1}>
          <Text
            modifiers={[
              font({ size: 8, weight: "bold" }),
              kerning(1.8),
              foregroundStyle(CREAM),
            ]}
          >
            QUIET NOW
          </Text>
          <Text modifiers={[font({ size: 16 }), foregroundStyle(WHITE)]}>
            {prayer.title}
          </Text>
        </VStack>
        <Spacer />
        <Text
          countsDown={true}
          modifiers={[
            font({ size: 16 }),
            monospacedDigit(),
            foregroundStyle(WHITE),
          ]}
          timerInterval={{ lower: new Date(props.startEpoch), upper: end }}
        />
      </HStack>
    ),
    compactLeading: (
      <Image color={CREAM} size={14} systemName="moon.stars.fill" />
    ),
    compactTrailing: (
      <Text
        countsDown={true}
        modifiers={[
          font({ size: 11 }),
          monospacedDigit(),
          foregroundStyle(CREAM),
        ]}
        timerInterval={{ lower: new Date(props.startEpoch), upper: end }}
      />
    ),
    minimal: <Image color={CREAM} size={14} systemName="moon.stars.fill" />,
    expandedLeading: (
      <Image color={CREAM} size={20} systemName="moon.stars.fill" />
    ),
    expandedCenter: (
      <VStack alignment="leading" spacing={2}>
        <HStack spacing={8}>
          <Text modifiers={[font({ size: 18 }), foregroundStyle(WHITE)]}>
            {prayer.title}
          </Text>
          <Text modifiers={[font({ size: 14 }), foregroundStyle(CREAM)]}>
            {prayer.arabic}
          </Text>
        </HStack>
      </VStack>
    ),
    expandedTrailing: (
      <VStack alignment="trailing" spacing={2}>
        <Text
          modifiers={[
            font({ size: 8, weight: "bold" }),
            kerning(1.6),
            foregroundStyle(CREAM),
          ]}
        >
          IN
        </Text>
        <Text
          date={end}
          dateStyle="timer"
          modifiers={[font({ size: 20 }), foregroundStyle(WHITE)]}
        />
      </VStack>
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
  const id = `${args.name}:${Date.now()}`;
  const activity = lockActivityFactory.start({
    prayerName: args.name,
    startEpoch: Date.parse(args.startISO),
    endEpoch: Date.parse(args.endISO),
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

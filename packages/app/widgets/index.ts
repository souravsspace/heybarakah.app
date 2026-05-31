import type { Widget } from "expo-widgets";
import type { WidgetProps } from "@/lib/widgets-native";
import { ayahWidget } from "@/widgets/ayah.widget";
import { dhikrWidget } from "@/widgets/dhikr.widget";
import { lockComplicationsWidget } from "@/widgets/lock-complications.widget";
import { salahArcWidget } from "@/widgets/salah-arc.widget";
import { streakWidget } from "@/widgets/streak.widget";

export { DHIKR_INCREMENT_TARGET } from "@/widgets/dhikr.widget";

/**
 * Every home-screen widget, keyed for timeline pushes. The official
 * `expo-widgets` model is app-pushes-to-widget: the app calls `updateTimeline`
 * on these instances (see `lib/widgets-native.ts`), and the same modules are
 * picked up by the widget extension's JS runtime to render.
 */
export const WIDGETS: Widget<WidgetProps, never>[] = [
  ayahWidget,
  dhikrWidget,
  streakWidget,
  salahArcWidget,
  lockComplicationsWidget,
] as unknown as Widget<WidgetProps, never>[];

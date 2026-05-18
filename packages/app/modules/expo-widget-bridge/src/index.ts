import {
  type EventSubscription,
  NativeModule,
  requireNativeModule,
} from "expo-modules-core";
import type { DhikrIncrementEvent, WidgetSnapshot } from "./types";

// biome-ignore lint/style/useConsistentTypeDefinitions: EventsMap requires a type alias with implicit index signature.
type Events = {
  onWidgetDhikrIncrement: (event: DhikrIncrementEvent) => void;
};

declare class WidgetBridgeNative extends NativeModule<Events> {
  setSnapshot(json: string): Promise<void>;
  reloadTimelines(): Promise<void>;
  consumePendingDhikr(): Promise<number>;
  startLockActivity(
    name: string,
    startISO: string,
    endISO: string
  ): Promise<string>;
  endLockActivity(id: string): Promise<void>;
  endAllLockActivities(): Promise<void>;
}

const native = requireNativeModule<WidgetBridgeNative>("WidgetBridge");

export async function setSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  await native.setSnapshot(JSON.stringify(snapshot));
}

export function reloadTimelines(): Promise<void> {
  return native.reloadTimelines();
}

export function consumePendingDhikr(): Promise<number> {
  return native.consumePendingDhikr();
}

export function startLockActivity(args: {
  name: string;
  startISO: string;
  endISO: string;
}): Promise<string> {
  return native.startLockActivity(args.name, args.startISO, args.endISO);
}

export function endLockActivity(id: string): Promise<void> {
  return native.endLockActivity(id);
}

export function endAllLockActivities(): Promise<void> {
  return native.endAllLockActivities();
}

export function addDhikrIncrementListener(
  handler: (event: DhikrIncrementEvent) => void
): EventSubscription {
  return native.addListener("onWidgetDhikrIncrement", handler);
}

export type { DhikrIncrementEvent, WidgetSnapshot } from "./types";

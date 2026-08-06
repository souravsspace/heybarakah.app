import type { PrayerWindow } from "@barakah/core/shieldSelection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  dateSeed,
  LAST_CALL_BODIES,
  LAST_CALL_TITLES,
  pickDaily,
} from "@/constants/notification-copy";
import type { Timings } from "@/lib/prayer-shield-windows";
import { prayerWindowEndMinutes } from "@/lib/prayer-window-end";

const LAST_CALL_IDS_KEY = "last-call-notification-ids:v1";

/** How long before a prayer's time expires the reminder fires. */
export const LAST_CALL_LEAD_MIN = 15;

interface ScheduleOptions {
  date?: Date;
  /** Prayers already recorded today — these are skipped, nobody wants a nag. */
  logged: readonly PrayerWindow[];
  nextDayFajr?: string | null;
  times: Timings;
  windows: readonly PrayerWindow[];
}

async function saveIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(LAST_CALL_IDS_KEY, JSON.stringify(ids));
}

async function loadIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(LAST_CALL_IDS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.every((value) => typeof value === "string")
    ) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export async function cancelLastCallNotifications(): Promise<void> {
  const ids = await loadIds();
  await Promise.all(
    ids.map(async (id) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        return;
      }
    })
  );
  await AsyncStorage.removeItem(LAST_CALL_IDS_KEY);
}

/**
 * Schedule the "you still haven't prayed and the time is running out" reminders.
 *
 * Unlike the shield notifications, these are re-issued whenever today's logs
 * change: a scheduled notification can't evaluate whether the prayer was logged
 * at fire time, so the only way to stay honest is to drop the ones that no
 * longer apply.
 */
export async function scheduleLastCallNotifications({
  date = new Date(),
  logged,
  nextDayFajr,
  times,
  windows,
}: ScheduleOptions): Promise<string[]> {
  await cancelLastCallNotifications();
  if (windows.length === 0) {
    return [];
  }
  const now = new Date();
  const seed = dateSeed(date);
  const ids: string[] = [];
  for (const w of windows) {
    if (logged.includes(w)) {
      continue;
    }
    const endMinutes = prayerWindowEndMinutes(w, times, nextDayFajr);
    if (endMinutes === null) {
      continue;
    }
    // Minute overflow rolls the date forward, which is what isha needs when its
    // Islamic-midnight boundary lands after 00:00.
    const fireAt = new Date(date);
    fireAt.setHours(0, endMinutes - LAST_CALL_LEAD_MIN, 0, 0);
    if (fireAt.getTime() <= now.getTime()) {
      continue;
    }
    const title = pickDaily(LAST_CALL_TITLES[w], `${seed}-${w}-last-title`);
    const body = pickDaily(LAST_CALL_BODIES, `${seed}-${w}-last-body`);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        // Loud on purpose: the shield reminders are quiet nudges, this one is
        // the last chance before the prayer becomes qadā. No `link` — the lock
        // window is long over by now, so the unlock screen would be nonsense.
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
    ids.push(id);
  }
  await saveIds(ids);
  return ids;
}

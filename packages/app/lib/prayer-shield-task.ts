import type { PrayerWindow } from "@barakah/core/shieldSelection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { isTemporarilyUnlocked, liftShieldNow } from "@/lib/app-blocker";
import { dateKey } from "@/lib/date-utils";
import { scheduleLastCallNotifications } from "@/lib/prayer-last-call-notifications";
import {
  type ShieldTimes,
  scheduleShieldNotifications,
} from "@/lib/prayer-shield-notifications";
import { isInsideAnyShieldWindow } from "@/lib/prayer-shield-windows";

export const PRAYER_SHIELD_TASK = "barakah.prayerShield.refresh";

const SHIELD_SCHEDULE_KEY = "shield-schedule:v1";

interface ShieldSchedule {
  /** Day `logged` describes. Absent on payloads written before it was tracked. */
  date?: string;
  /** Prayers already recorded on `date`. */
  logged?: PrayerWindow[];
  nextDayFajr?: string | null;
  times: ShieldTimes;
  windows: PrayerWindow[];
}

/**
 * Release a shield that outlived its window.
 *
 * `intervalDidEnd` in the DeviceActivity extension is the only thing that lifts
 * the shield while the app is closed, and an extension that gets jetsammed or
 * never launches leaves apps blocked with no way for the user to notice — they
 * can't be nudged into Barakah by the very apps it is blocking. This task wakes
 * without the app, so it is the one place that can undo that.
 */
function reconcileShield(schedule: ShieldSchedule): void {
  if (Platform.OS !== "ios") {
    return;
  }
  if (isTemporarilyUnlocked()) {
    return;
  }
  if (isInsideAnyShieldWindow(schedule.windows, schedule.times)) {
    return;
  }
  liftShieldNow();
}

/** Persist the data the background task needs to reschedule notifications while
 *  the app is closed. Called from the foreground sync whenever the shield is on. */
export async function persistShieldSchedule(
  schedule: ShieldSchedule
): Promise<void> {
  try {
    await AsyncStorage.setItem(SHIELD_SCHEDULE_KEY, JSON.stringify(schedule));
  } catch {
    return;
  }
}

/** Drop the persisted schedule so the background task no-ops when the shield is
 *  disabled. */
export async function clearShieldSchedule(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SHIELD_SCHEDULE_KEY);
  } catch {
    return;
  }
}

async function loadShieldSchedule(): Promise<ShieldSchedule | null> {
  try {
    const raw = await AsyncStorage.getItem(SHIELD_SCHEDULE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ShieldSchedule;
    if (!Array.isArray(parsed.windows) || parsed.windows.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

TaskManager.defineTask(PRAYER_SHIELD_TASK, async () => {
  try {
    const schedule = await loadShieldSchedule();
    if (!schedule) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }
    // Reschedule today's shield notifications against the current wall-clock so
    // reminders stay fresh across day boundaries while the app is not opened.
    await scheduleShieldNotifications({
      windows: schedule.windows,
      times: schedule.times,
    });
    await scheduleLastCallNotifications({
      // A stale `logged` from a previous day would silence today's reminders.
      logged: schedule.date === dateKey() ? (schedule.logged ?? []) : [],
      nextDayFajr: schedule.nextDayFajr,
      times: schedule.times,
      windows: schedule.windows,
    });
    reconcileShield(schedule);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerPrayerShieldTask(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      return;
    }
    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(PRAYER_SHIELD_TASK);
    if (isRegistered) {
      return;
    }
    await BackgroundTask.registerTaskAsync(PRAYER_SHIELD_TASK, {
      minimumInterval: 15 * 60,
    });
  } catch {
    return;
  }
}

export async function unregisterPrayerShieldTask(): Promise<void> {
  try {
    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(PRAYER_SHIELD_TASK);
    if (isRegistered) {
      await BackgroundTask.unregisterTaskAsync(PRAYER_SHIELD_TASK);
    }
  } catch {
    return;
  }
}

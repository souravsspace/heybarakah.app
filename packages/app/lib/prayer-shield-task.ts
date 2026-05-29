import type { PrayerWindow } from "@barakah/core/shieldSelection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import {
  type ShieldTimes,
  scheduleShieldNotifications,
} from "@/lib/prayer-shield-notifications";

export const PRAYER_SHIELD_TASK = "barakah.prayerShield.refresh";

const SHIELD_SCHEDULE_KEY = "shield-schedule:v1";

interface ShieldSchedule {
  times: ShieldTimes;
  windows: PrayerWindow[];
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

import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

export const PRAYER_SHIELD_TASK = "barakah.prayerShield.refresh";

TaskManager.defineTask(PRAYER_SHIELD_TASK, async () => {
  try {
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

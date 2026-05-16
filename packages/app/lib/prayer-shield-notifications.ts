import type { PrayerWindow } from "@barakah/core/shieldSelection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { lockBoundsMinutes, NOTIF_LEAD_MIN } from "@/lib/prayer-window-config";

const SHIELD_NOTIFICATION_IDS_KEY = "shield-notification-ids:v1";
const SHIELD_TIME_REGEX = /^(\d{1,2}):(\d{2})/;

const WINDOW_TITLE: Record<PrayerWindow, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

interface ShieldTimes {
  asr: string;
  dhuhr: string;
  fajr: string;
  isha: string;
  maghrib: string;
}

interface ScheduleOptions {
  date?: Date;
  times: ShieldTimes;
  windows: PrayerWindow[];
}

function lockStartAt(
  baseDate: Date,
  window: PrayerWindow,
  hhmm: string
): Date | null {
  const match = SHIELD_TIME_REGEX.exec(hhmm.trim());
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  const adhanMinutes = hour * 60 + minute;
  const { start } = lockBoundsMinutes(window, adhanMinutes);
  const fireMinutes = start - NOTIF_LEAD_MIN;
  const scheduled = new Date(baseDate);
  scheduled.setHours(0, 0, 0, 0);
  scheduled.setTime(scheduled.getTime() + fireMinutes * 60_000);
  return scheduled;
}

async function saveIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(SHIELD_NOTIFICATION_IDS_KEY, JSON.stringify(ids));
}

async function loadIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SHIELD_NOTIFICATION_IDS_KEY);
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

export async function cancelShieldNotifications(): Promise<void> {
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
  await AsyncStorage.removeItem(SHIELD_NOTIFICATION_IDS_KEY);
}

export async function scheduleShieldNotifications({
  date = new Date(),
  windows,
  times,
}: ScheduleOptions): Promise<string[]> {
  await cancelShieldNotifications();
  if (windows.length === 0) {
    return [];
  }
  const now = new Date();
  const ids: string[] = [];
  for (const w of windows) {
    const fireAt = lockStartAt(date, w, times[w]);
    if (!fireAt || fireAt.getTime() <= now.getTime()) {
      continue;
    }
    const title = WINDOW_TITLE[w];
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Quiet starts at ${title}`,
        body: "Open Barakah to enter salah.",
        sound: false,
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

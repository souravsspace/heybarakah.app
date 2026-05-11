import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const PRAYER_NOTIFICATION_IDS_KEY = "prayer-notification-ids:v1";
const PRAYER_TIME_REGEX = /^(\d{1,2}):(\d{2})/;

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const PRAYERS_TO_NOTIFY: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

interface PrayerTimeMap {
  asr: string;
  dhuhr: string;
  fajr: string;
  isha: string;
  maghrib: string;
  sunrise?: string;
}

interface SchedulePrayerNotificationsOptions {
  date?: Date;
  locationLabel: string;
  times: PrayerTimeMap;
}

interface ScheduledPrayerNotification {
  id: string;
  prayer: PrayerName;
  scheduledFor: Date;
}

function titleCasePrayer(prayer: PrayerName): string {
  switch (prayer) {
    case "fajr":
      return "Fajr";
    case "dhuhr":
      return "Dhuhr";
    case "asr":
      return "Asr";
    case "maghrib":
      return "Maghrib";
    case "isha":
      return "Isha";
    default:
      return prayer;
  }
}

function parsePrayerTimeForDate(baseDate: Date, hhmm: string): Date | null {
  const match = PRAYER_TIME_REGEX.exec(hhmm.trim());
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

  const scheduled = new Date(baseDate);
  scheduled.setHours(hour, minute, 0, 0);
  return scheduled;
}

async function saveScheduledNotificationIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(PRAYER_NOTIFICATION_IDS_KEY, JSON.stringify(ids));
}

async function loadScheduledNotificationIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(PRAYER_NOTIFICATION_IDS_KEY);
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

export async function requestPrayerNotificationPermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (
      existing.granted ||
      existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return (
      requested.granted ||
      requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

export async function schedulePrayerNotifications({
  date = new Date(),
  locationLabel,
  times,
}: SchedulePrayerNotificationsOptions): Promise<ScheduledPrayerNotification[]> {
  const now = new Date();
  const scheduled: ScheduledPrayerNotification[] = [];

  for (const prayer of PRAYERS_TO_NOTIFY) {
    const prayerTime = times[prayer];
    const scheduledFor = parsePrayerTimeForDate(date, prayerTime);
    if (!scheduledFor || scheduledFor.getTime() <= now.getTime()) {
      continue;
    }

    const prayerTitle = titleCasePrayer(prayer);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayerTitle} reminder`,
        body: `It is time for ${prayerTitle} in ${locationLabel}.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledFor,
      },
    });

    scheduled.push({ id, prayer, scheduledFor });
  }

  await saveScheduledNotificationIds(scheduled.map((entry) => entry.id));
  return scheduled;
}

export async function cancelPrayerNotifications(): Promise<void> {
  const ids = await loadScheduledNotificationIds();

  await Promise.all(
    ids.map(async (id) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        return;
      }
    }),
  );

  await AsyncStorage.removeItem(PRAYER_NOTIFICATION_IDS_KEY);
}

export async function reschedulePrayerNotifications(
  options: SchedulePrayerNotificationsOptions,
): Promise<ScheduledPrayerNotification[]> {
  await cancelPrayerNotifications();
  return schedulePrayerNotifications(options);
}

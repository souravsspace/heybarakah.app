import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { AYAHS } from "@/constants/ayahs";
import { AYAH_TITLES, pickDaily } from "@/constants/notification-copy";
import { lockBoundsMinutes } from "@/lib/prayer-window-config";

const AYAH_NOTIF_KEY = "ayah-notification:v1";
const TIME_REGEX = /^(\d{1,2}):(\d{2})/;
const PRAYER_BUFFER_MIN = 20;
const MINUTES_IN_DAY = 24 * 60;

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const PRAYER_NAMES: readonly PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

interface PrayerTimes {
  asr: string;
  dhuhr: string;
  fajr: string;
  isha: string;
  maghrib: string;
}

interface StoredAyahNotif {
  dateKey: string;
  id: string;
}

interface ScheduleAyahOptions {
  date?: Date;
  times: PrayerTimes;
}

interface Range {
  end: number;
  start: number;
}

function parseHHmm(hhmm: string): number | null {
  const match = TIME_REGEX.exec(hhmm.trim());
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
  return hour * 60 + minute;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function forbiddenRanges(times: PrayerTimes): Range[] {
  const ranges: Range[] = [];
  for (const name of PRAYER_NAMES) {
    const adhan = parseHHmm(times[name]);
    if (adhan === null) {
      continue;
    }
    const { start: lockStart, end: lockEnd } = lockBoundsMinutes(name, adhan);
    const start = Math.max(0, Math.min(adhan, lockStart) - PRAYER_BUFFER_MIN);
    const end = Math.min(
      MINUTES_IN_DAY,
      Math.max(adhan, lockEnd) + PRAYER_BUFFER_MIN
    );
    ranges.push({ start, end });
  }
  return ranges.sort((a, b) => a.start - b.start);
}

function isInRanges(minute: number, ranges: readonly Range[]): boolean {
  for (const r of ranges) {
    if (minute >= r.start && minute < r.end) {
      return true;
    }
  }
  return false;
}

function pickRandomMinute(
  earliest: number,
  ranges: readonly Range[]
): number | null {
  const candidates: number[] = [];
  for (let m = earliest; m < MINUTES_IN_DAY; m += 1) {
    if (!isInRanges(m, ranges)) {
      candidates.push(m);
    }
  }
  if (candidates.length === 0) {
    return null;
  }
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx] ?? null;
}

async function loadStored(): Promise<StoredAyahNotif | null> {
  const raw = await AsyncStorage.getItem(AYAH_NOTIF_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "id" in parsed &&
      "dateKey" in parsed &&
      typeof (parsed as StoredAyahNotif).id === "string" &&
      typeof (parsed as StoredAyahNotif).dateKey === "string"
    ) {
      return parsed as StoredAyahNotif;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveStored(value: StoredAyahNotif): Promise<void> {
  await AsyncStorage.setItem(AYAH_NOTIF_KEY, JSON.stringify(value));
}

export async function cancelDailyAyahNotification(): Promise<void> {
  const stored = await loadStored();
  if (!stored) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(stored.id);
  } catch {
    // noop
  }
  await AsyncStorage.removeItem(AYAH_NOTIF_KEY);
}

export async function scheduleDailyAyahNotification({
  date = new Date(),
  times,
}: ScheduleAyahOptions): Promise<string | null> {
  const today = dateKey(date);
  const stored = await loadStored();
  if (stored && stored.dateKey === today) {
    return stored.id;
  }
  if (stored) {
    try {
      await Notifications.cancelScheduledNotificationAsync(stored.id);
    } catch {
      // noop
    }
    await AsyncStorage.removeItem(AYAH_NOTIF_KEY);
  }

  const now = new Date();
  const earliest =
    today === dateKey(now) ? now.getHours() * 60 + now.getMinutes() + 1 : 0;
  const ranges = forbiddenRanges(times);
  const minute = pickRandomMinute(earliest, ranges);
  if (minute === null) {
    return null;
  }

  const fireAt = new Date(date);
  fireAt.setHours(Math.floor(minute / 60), minute % 60, 0, 0);

  const seed = `ayah-${today}`;
  const ayah = pickDaily(AYAHS, seed);
  const title = pickDaily(AYAH_TITLES, `${seed}-title`);
  const body = `${ayah.translation}\n— ${ayah.reference}`;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });

  await saveStored({ id, dateKey: today });
  return id;
}

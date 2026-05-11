import { ALADHAN_BASE_URL, PRAYER_NAMES } from "./constants";
import { normalizeAlAdhanTimingString } from "./normalize";
import type {
  AlAdhanCalendarResponse,
  AlAdhanDayResponse,
  PrayerDay,
  PrayerName,
  PrayerTimesRequestInput,
} from "./types";

function parseAlAdhanDateToDateKey(date: string): string {
  const [day, month, year] = date.split("-");
  if (!(day && month && year)) {
    throw new Error(`Invalid AlAdhan Gregorian date: ${date}`);
  }
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function buildAlAdhanQuery(input: PrayerTimesRequestInput): URLSearchParams {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    method: String(input.method),
    school: String(input.school),
    timezonestring: input.timezone,
  });

  if (input.latitudeAdjustmentMethod !== undefined) {
    params.set(
      "latitudeAdjustmentMethod",
      String(input.latitudeAdjustmentMethod)
    );
  }
  if (input.midnightMode !== undefined) {
    params.set("midnightMode", String(input.midnightMode));
  }
  if (input.tune !== undefined) {
    params.set("tune", input.tune);
  }

  return params;
}

export function createAlAdhanCalendarUrl(
  input: PrayerTimesRequestInput
): string {
  const start = new Date(`${input.startDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid startDate: ${input.startDate}`);
  }

  const month = start.getUTCMonth() + 1;
  const year = start.getUTCFullYear();
  const query = buildAlAdhanQuery(input);
  return `${ALADHAN_BASE_URL}/calendar/${year}/${month}?${query.toString()}`;
}

async function parseResponseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().includes("application/json")) {
    return response.json();
  }

  const textBody = await response.text();
  try {
    return JSON.parse(textBody) as unknown;
  } catch {
    return {};
  }
}

export async function fetchAlAdhanCalendarByCoordinates(
  input: PrayerTimesRequestInput
): Promise<AlAdhanCalendarResponse> {
  const url = createAlAdhanCalendarUrl(input);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`AlAdhan request failed: HTTP ${response.status}`);
  }

  const parsed = (await parseResponseJson(response)) as AlAdhanCalendarResponse;
  if (!Array.isArray(parsed.data)) {
    throw new Error("AlAdhan calendar response missing data array");
  }

  return parsed;
}

export async function fetchAlAdhanTimingsByCoordinates(
  input: PrayerTimesRequestInput & { date: string }
): Promise<AlAdhanDayResponse> {
  const query = buildAlAdhanQuery(input);
  const url = `${ALADHAN_BASE_URL}/timings/${input.date}?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`AlAdhan request failed: HTTP ${response.status}`);
  }

  const parsed = (await parseResponseJson(response)) as {
    data?: AlAdhanDayResponse;
  };
  if (!parsed.data || typeof parsed.data !== "object") {
    throw new Error("AlAdhan timings response missing data object");
  }

  return parsed.data;
}

function pickRequiredTimings(
  day: AlAdhanDayResponse,
  date: string
): Record<PrayerName, string> {
  const timings = day.timings;
  if (!timings) {
    throw new Error(`AlAdhan day missing timings for ${date}`);
  }

  const map: Record<PrayerName, string> = {
    fajr: normalizeAlAdhanTimingString(timings.Fajr ?? ""),
    sunrise: normalizeAlAdhanTimingString(timings.Sunrise ?? ""),
    dhuhr: normalizeAlAdhanTimingString(timings.Dhuhr ?? ""),
    asr: normalizeAlAdhanTimingString(timings.Asr ?? ""),
    maghrib: normalizeAlAdhanTimingString(timings.Maghrib ?? ""),
    isha: normalizeAlAdhanTimingString(timings.Isha ?? ""),
  };

  for (const prayer of PRAYER_NAMES) {
    if (!map[prayer]) {
      throw new Error(`Missing required prayer '${prayer}' for ${date}`);
    }
  }

  return map;
}

export function normalizeAlAdhanCalendarResponse(
  response: AlAdhanCalendarResponse,
  input: PrayerTimesRequestInput
): PrayerDay[] {
  if (!Array.isArray(response.data)) {
    throw new Error("AlAdhan calendar response missing data array");
  }

  return response.data.map((day) => {
    const gregorian = day.date?.gregorian?.date;
    if (!gregorian) {
      throw new Error("AlAdhan day missing Gregorian date");
    }

    const date = parseAlAdhanDateToDateKey(gregorian);
    return {
      date,
      hijriDate: day.date?.hijri?.date,
      timings: pickRequiredTimings(day, date),
      timezone: input.timezone,
      method: input.method,
      school: input.school,
      location: {
        latitude: input.latitude,
        longitude: input.longitude,
      },
      source: "aladhan",
    };
  });
}

export function normalizeAlAdhanDay(
  day: AlAdhanDayResponse,
  input: PrayerTimesRequestInput
): PrayerDay {
  const gregorian = day.date?.gregorian?.date;
  if (!gregorian) {
    throw new Error("AlAdhan day missing Gregorian date");
  }

  const date = parseAlAdhanDateToDateKey(gregorian);
  return {
    date,
    hijriDate: day.date?.hijri?.date,
    timings: pickRequiredTimings(day, date),
    timezone: input.timezone,
    method: input.method,
    school: input.school,
    location: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    source: "aladhan",
  };
}

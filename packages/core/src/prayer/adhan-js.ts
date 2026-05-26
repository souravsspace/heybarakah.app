import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import { ALADHAN_METHOD_IDS } from "./constants";
import { addDays, parseDateKey } from "./normalize";
import type { PrayerDay, PrayerLocation, PrayerSettings } from "./types";

export function getAdhanJsCalculationParameters(method: number) {
  switch (method) {
    case ALADHAN_METHOD_IDS.KARACHI:
      return CalculationMethod.Karachi();
    case ALADHAN_METHOD_IDS.ISNA:
      return CalculationMethod.NorthAmerica();
    case ALADHAN_METHOD_IDS.MUSLIM_WORLD_LEAGUE:
      return CalculationMethod.MuslimWorldLeague();
    case ALADHAN_METHOD_IDS.UMM_AL_QURA:
      return CalculationMethod.UmmAlQura();
    case ALADHAN_METHOD_IDS.EGYPTIAN:
      return CalculationMethod.Egyptian();
    case ALADHAN_METHOD_IDS.KUWAIT:
      return CalculationMethod.Kuwait();
    case ALADHAN_METHOD_IDS.QATAR:
      return CalculationMethod.Qatar();
    case ALADHAN_METHOD_IDS.SINGAPORE:
      return CalculationMethod.Singapore();
    case ALADHAN_METHOD_IDS.TURKEY:
      return CalculationMethod.Turkey();
    case ALADHAN_METHOD_IDS.MOONSIGHTING:
      return CalculationMethod.MoonsightingCommittee();
    default:
      return null;
  }
}

export function isAdhanJsSupportedMethod(method: number): boolean {
  return getAdhanJsCalculationParameters(method) !== null;
}

export const supportsAdhanFallback = isAdhanJsSupportedMethod;

function formatInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(date);
}

function pad2(n: string): string {
  return n.padStart(2, "0");
}

function formatHijriDate(date: Date, timezone: string): string | undefined {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: timezone,
    }).formatToParts(date);
    const map = new Map(parts.map((p) => [p.type, p.value]));
    const day = map.get("day");
    const month = map.get("month");
    const year = map.get("year");
    if (!(day && month && year)) {
      return;
    }
    const yearDigits = year.replace(/\D/g, "");
    if (!yearDigits) {
      return;
    }
    return `${pad2(day)}-${pad2(month)}-${yearDigits}`;
  } catch {
    return;
  }
}

export function calculateAdhanJsPrayerDays(
  input: PrayerLocation & PrayerSettings & { startDate: string; days: number }
): PrayerDay[] | null {
  const params = getAdhanJsCalculationParameters(input.method);
  if (!params) {
    return null;
  }

  params.madhab = input.school === 1 ? Madhab.Hanafi : Madhab.Shafi;
  const coordinates = new Coordinates(input.latitude, input.longitude);

  return Array.from({ length: input.days }, (_, index) => {
    const date = addDays(input.startDate, index);
    const prayerTimes = new PrayerTimes(
      coordinates,
      parseDateKey(date),
      params
    );

    return {
      date,
      hijriDate: formatHijriDate(prayerTimes.dhuhr, input.timezone),
      timings: {
        fajr: formatInTimezone(prayerTimes.fajr, input.timezone),
        sunrise: formatInTimezone(prayerTimes.sunrise, input.timezone),
        dhuhr: formatInTimezone(prayerTimes.dhuhr, input.timezone),
        asr: formatInTimezone(prayerTimes.asr, input.timezone),
        maghrib: formatInTimezone(prayerTimes.maghrib, input.timezone),
        isha: formatInTimezone(prayerTimes.isha, input.timezone),
      },
      timezone: input.timezone,
      method: input.method,
      school: input.school,
      location: { latitude: input.latitude, longitude: input.longitude },
      source: "adhan-js",
    };
  });
}

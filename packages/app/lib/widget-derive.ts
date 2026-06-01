import type { PrayerName, WidgetSnapshot } from "@/lib/widgets-native";

/**
 * Pure, Intl-free derivations for the home-screen widgets. The official
 * `expo-widgets` runtime renders each timeline entry with its own `ctx.date`,
 * so these are evaluated at render time against that date — never baked into
 * the stored snapshot. Ports `PrayerModel`, `Celestial`, and `Hijri` from the
 * old SwiftUI widget so the widget JSX stays purely presentational.
 */

export interface PrayerInfo {
  arabic: string;
  letter: string;
  name: PrayerName;
  title: string;
}

export const PRAYER_CATALOG: Record<PrayerName, PrayerInfo> = {
  fajr: { name: "fajr", title: "Fajr", arabic: "الفجر", letter: "F" },
  dhuhr: { name: "dhuhr", title: "Dhuhr", arabic: "الظهر", letter: "D" },
  asr: { name: "asr", title: "Asr", arabic: "العصر", letter: "A" },
  maghrib: { name: "maghrib", title: "Maghrib", arabic: "المغرب", letter: "M" },
  isha: { name: "isha", title: "Isha", arabic: "العشاء", letter: "I" },
};

const PRAYER_FALLBACK = PRAYER_CATALOG.fajr;

interface ParsedISO {
  epochMs: number;
  minuteOfDay: number;
}

const ISO_HM_GROUPS = /T(\d{2}):(\d{2})/;
const ISO_HM = /T(\d{2}:\d{2})/;

/**
 * Parse a snapshot ISO string (`YYYY-MM-DDTHH:MM:SS±HH:MM`). `minuteOfDay` is
 * read straight from the local wall-clock portion, so it needs no timezone
 * database — the offset is already baked into the string by the writer.
 */
export function parseSnapshotISO(iso: string): ParsedISO | null {
  const epochMs = Date.parse(iso);
  if (Number.isNaN(epochMs)) {
    return null;
  }
  const match = iso.match(ISO_HM_GROUPS);
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return { epochMs, minuteOfDay: hour * 60 + minute };
}

export function formatCountdown(min: number): string {
  if (min <= 0) {
    return "now";
  }
  if (min < 60) {
    return `${min}m`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** "HH:MM" wall-clock label read directly from a snapshot ISO string. */
export function formatHM(iso: string): string {
  const match = iso.match(ISO_HM);
  return match ? match[1] : "--:--";
}

export interface RailPoint {
  info: PrayerInfo;
  isCurrent: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  name: PrayerName;
  pct: number;
}

export interface PrayerState {
  countdownMinutes: number;
  countdownText: string;
  display: PrayerInfo;
  isActive: boolean;
  isLocked: boolean;
  nextTitle: string;
  points: RailPoint[];
  timeText: string;
}

interface ParsedPrayer {
  adhan: ParsedISO;
  end: ParsedISO;
  info: PrayerInfo;
  start: ParsedISO;
}

/**
 * Derived prayer-day state evaluated at `nowMs` (the widget entry date).
 * Faithful port of `PrayerModel.from` from the old SwiftUI widget.
 */
export function derivePrayerState(
  snapshot: WidgetSnapshot,
  nowMs: number
): PrayerState {
  const parsed: ParsedPrayer[] = [];
  for (const p of snapshot.prayers) {
    const adhan = parseSnapshotISO(p.adhanISO);
    const start = parseSnapshotISO(p.startISO);
    const end = parseSnapshotISO(p.endISO);
    if (adhan && start && end) {
      parsed.push({ info: PRAYER_CATALOG[p.name], adhan, start, end });
    }
  }

  // Active prayer mirrors the app's `activePrayerNow` (date-utils.ts): the latest
  // prayer whose adhan has already passed stays "current" until the next adhan
  // (the day's last prayer runs until tomorrow's Fajr). The lock window
  // (`start`/`end`) is a separate, much narrower "quiet" period — it must NOT
  // decide which prayer is shown, only the QUIET badge.
  let current: ParsedPrayer | null = null;
  for (const p of parsed) {
    if (p.adhan.epochMs <= nowMs) {
      current = p;
    }
  }
  const next = parsed.find((p) => p.adhan.epochMs > nowMs) ?? null;

  const displayParsed = current ?? next ?? parsed[0] ?? null;
  const display = displayParsed?.info ?? PRAYER_FALLBACK;

  const isLocked =
    current !== null &&
    nowMs >= current.start.epochMs &&
    nowMs <= current.end.epochMs;

  // Countdown always points at the next adhan boundary (after the last prayer,
  // tomorrow's Fajr) — i.e. time left in the active prayer, or time until the
  // upcoming one. `timeText` is the displayed prayer's own adhan clock.
  let countdownMs = 0;
  let timeIso: string | null = null;
  const fajrTomorrow = snapshot.tomorrowFajrISO
    ? parseSnapshotISO(snapshot.tomorrowFajrISO)
    : null;
  if (current) {
    timeIso = snapshotISOFor(snapshot, current.info.name, "adhanISO");
    if (next) {
      countdownMs = next.adhan.epochMs - nowMs;
    } else if (fajrTomorrow) {
      countdownMs = fajrTomorrow.epochMs - nowMs;
    }
  } else if (next) {
    countdownMs = next.adhan.epochMs - nowMs;
    timeIso = snapshotISOFor(snapshot, next.info.name, "adhanISO");
  } else if (fajrTomorrow && snapshot.tomorrowFajrISO) {
    countdownMs = fajrTomorrow.epochMs - nowMs;
    timeIso = snapshot.tomorrowFajrISO;
  }
  const countdownMinutes = Math.max(0, Math.floor(countdownMs / 60_000));

  const minutes = parsed.map((p) => p.adhan.minuteOfDay);
  const first = minutes.length > 0 ? Math.min(...minutes) : 0;
  const last = minutes.length > 0 ? Math.max(...minutes) : 1;
  const span = Math.max(1, last - first);
  const currentAdhan = current?.adhan.epochMs ?? null;
  const points: RailPoint[] = parsed.map((p) => ({
    name: p.info.name,
    info: p.info,
    pct: (p.adhan.minuteOfDay - first) / span,
    isCurrent: current?.info.name === p.info.name,
    isPast: currentAdhan !== null && p.adhan.epochMs < currentAdhan,
    isUpcoming: p.adhan.epochMs > nowMs,
  }));

  return {
    display,
    isActive: current !== null,
    isLocked,
    timeText: timeIso ? formatHM(timeIso) : "--:--",
    countdownText: formatCountdown(countdownMinutes),
    countdownMinutes,
    points,
    nextTitle: (next ?? parsed[0])?.info.title ?? display.title,
  };
}

function snapshotISOFor(
  snapshot: WidgetSnapshot,
  name: PrayerName,
  key: "adhanISO" | "startISO" | "endISO"
): string | null {
  return snapshot.prayers.find((p) => p.name === name)?.[key] ?? null;
}

export interface SkyTone {
  isMoon: boolean;
  sky1: string;
  sky2: string;
  sun: string;
}

interface SkyStop {
  isMoon: boolean;
  sky1: number;
  sky2: number;
  sun: number;
  t: number;
}

const SKY_STOPS: SkyStop[] = [
  { t: 0, sky1: 0x0a_14_2a, sky2: 0x02_04_10, sun: 0x9e_ac_cb, isMoon: true },
  {
    t: 4 * 60 + 30,
    sky1: 0x1f_2a_4f,
    sky2: 0x08_10_1e,
    sun: 0xe8_c7_a4,
    isMoon: true,
  },
  {
    t: 6 * 60,
    sky1: 0xf3_b1_87,
    sky2: 0xfb_e1_cc,
    sun: 0xf5_9f_6c,
    isMoon: false,
  },
  {
    t: 9 * 60,
    sky1: 0xc5_dc_ef,
    sky2: 0xfb_f3_e6,
    sun: 0xf5_d7_7b,
    isMoon: false,
  },
  {
    t: 12 * 60 + 15,
    sky1: 0x9c_c3_e8,
    sky2: 0xf6_f1_de,
    sun: 0xfb_e7_9b,
    isMoon: false,
  },
  {
    t: 15 * 60 + 45,
    sky1: 0xb2_cc_e2,
    sky2: 0xf9_e3_c6,
    sun: 0xf7_b7_5e,
    isMoon: false,
  },
  {
    t: 18 * 60 + 42,
    sky1: 0x7c_3c_4d,
    sky2: 0xe4_a7_6b,
    sun: 0xec_6a_3e,
    isMoon: false,
  },
  {
    t: 20 * 60 + 30,
    sky1: 0x27_28_4d,
    sky2: 0x5a_2f_4a,
    sun: 0xe0_a3_68,
    isMoon: false,
  },
  {
    t: 23 * 60,
    sky1: 0x0a_14_2a,
    sky2: 0x02_04_10,
    sun: 0xcf_d5_e6,
    isMoon: true,
  },
  {
    t: 24 * 60,
    sky1: 0x0a_14_2a,
    sky2: 0x02_04_10,
    sun: 0x9e_ac_cb,
    isMoon: true,
  },
];

function hex(n: number): string {
  return `#${n.toString(16).padStart(6, "0")}`;
}

function lerpHex(a: number, b: number, k: number): string {
  const ar = Math.floor(a / 65_536);
  const ag = Math.floor(a / 256) % 256;
  const ab = a % 256;
  const br = Math.floor(b / 65_536);
  const bg = Math.floor(b / 256) % 256;
  const bb = b % 256;
  const rr = Math.round(ar + (br - ar) * k);
  const gg = Math.round(ag + (bg - ag) * k);
  const bl = Math.round(ab + (bb - ab) * k);
  return hex(rr * 65_536 + gg * 256 + bl);
}

/** Time-of-day sky tone for the celestial direction. Ports `Celestial.tone`. */
export function celestialTone(nowMin: number): SkyTone {
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[i + 1];
    if (nowMin >= a.t && nowMin < b.t) {
      const k = (nowMin - a.t) / (b.t - a.t);
      return {
        sky1: lerpHex(a.sky1, b.sky1, k),
        sky2: lerpHex(a.sky2, b.sky2, k),
        sun: lerpHex(a.sun, b.sun, k),
        isMoon: a.isMoon,
      };
    }
  }
  const last = SKY_STOPS.at(-1) as SkyStop;
  return {
    sky1: hex(last.sky1),
    sky2: hex(last.sky2),
    sun: hex(last.sun),
    isMoon: last.isMoon,
  };
}

/** Local minute-of-day of an epoch given a fixed offset (minutes east of UTC). */
export function localMinuteOfDay(epochMs: number, offsetMin: number): number {
  const shifted = new Date(epochMs + offsetMin * 60_000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiʻ I",
  "Rabiʻ II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Shaʻban",
  "Ramadan",
  "Shawwal",
  "Dhuʻl-Qiʻdah",
  "Dhuʻl-Hijjah",
];

/** Exposed for unit tests. */
export const HIJRI_MONTHS_INTERNAL = HIJRI_MONTHS;

/**
 * Tabular Islamic (civil / Kuwaiti) calendar — pure arithmetic, no ICU. Within
 * ±1 day of the Umm al-Qura calendar the old Swift widget used; that delta is
 * acceptable for a glanceable widget label. Input is a UTC y/m/d.
 */
export function hijriDateString(epochMs: number): string {
  const d = new Date(epochMs);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  // Gregorian → Julian Day Number.
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32_045;

  // Julian Day Number → tabular Islamic date.
  const l0 = jdn - 1_948_440 + 10_632;
  const n = Math.floor((l0 - 1) / 10_631);
  let l = l0 - 10_631 * n + 354;
  const j =
    Math.floor((10_985 - l) / 5316) * Math.floor((50 * l) / 17_719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15_238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17_719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15_238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const hijriDay = l - Math.floor((709 * month) / 24);

  const name = HIJRI_MONTHS[Math.min(Math.max(month - 1, 0), 11)];
  return `${hijriDay} ${name}`;
}

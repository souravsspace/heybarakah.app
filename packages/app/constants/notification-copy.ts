import type { PrayerWindow } from "@barakah/core/shieldSelection";

export const SHIELD_TITLES: Record<PrayerWindow, readonly string[]> = {
  fajr: [
    "Fajr nears",
    "Quiet at Fajr",
    "Fajr stillness",
    "Pause for Fajr",
    "Hands quiet — Fajr",
    "Fajr is close",
  ],
  dhuhr: [
    "Dhuhr nears",
    "Quiet at Dhuhr",
    "Dhuhr stillness",
    "Pause for Dhuhr",
    "Hands quiet — Dhuhr",
    "Dhuhr is close",
  ],
  asr: [
    "Asr nears",
    "Quiet at Asr",
    "Asr stillness",
    "Pause for Asr",
    "Hands quiet — Asr",
    "Asr is close",
  ],
  maghrib: [
    "Maghrib nears",
    "Quiet at Maghrib",
    "Maghrib stillness",
    "Pause for Maghrib",
    "Hands quiet — Maghrib",
    "Maghrib is close",
  ],
  isha: [
    "Isha nears",
    "Quiet at Isha",
    "Isha stillness",
    "Pause for Isha",
    "Hands quiet — Isha",
    "Isha is close",
  ],
};

export const SHIELD_BODIES: readonly string[] = [
  "Open Barakah. Enter salah.",
  "The apps go quiet for a moment.",
  "Fifteen minutes for Him.",
  "Stillness, then return.",
  "A pause between you and the world.",
  "Step away. Stand before Allah.",
  "Hands down. Heart up.",
  "Quiet now. The world can wait.",
];

export const AYAH_TITLES: readonly string[] = [
  "A reminder",
  "From the Qur'an",
  "A verse for you",
  "Something to carry",
  "A line to hold",
  "From His words",
];

const HASH_MOD = 2_147_483_647;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % HASH_MOD;
  }
  return hash;
}

export function pickDaily<T>(pool: readonly T[], seed: string): T {
  if (pool.length === 0) {
    throw new Error("pickDaily: empty pool");
  }
  const idx = hashString(seed) % pool.length;
  const value = pool[idx];
  if (value === undefined) {
    throw new Error("pickDaily: invalid index");
  }
  return value;
}

export function dateSeed(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

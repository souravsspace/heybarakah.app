import { AYAHS, type Ayah } from "@/constants/ayahs";

const HASH_PRIME = 31;
const HASH_MOD = 2_147_483_647;

function hashDateKey(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * HASH_PRIME + dateKey.charCodeAt(i)) % HASH_MOD;
  }
  return h;
}

export function pickDailyAyah(dateKey: string): Ayah {
  if (AYAHS.length === 0) {
    throw new Error("AYAHS is empty");
  }
  return AYAHS[hashDateKey(dateKey) % AYAHS.length];
}

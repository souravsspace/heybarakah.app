export interface DateRange {
  end: string;
  start: string;
}

// Source: Aladhan API hijri-to-gregorian calendar (Umm al-Qura calculation).
// Local moon sighting may shift dates by one day either side.
// 2030+ entries generated from the `islamic-umalqura` Intl calendar (Ramadan =
// Hijri month 9). Regenerate/extend before 2040 — see git history for the
// one-off Intl script. Kept as a static table (not runtime Intl) because the
// Hermes RN engine and workerd don't reliably ship the islamic calendar.
export const RAMADAN_RANGES: readonly DateRange[] = [
  { start: "2025-03-01", end: "2025-03-29" },
  { start: "2026-02-18", end: "2026-03-19" },
  { start: "2027-02-08", end: "2027-03-08" },
  { start: "2028-01-28", end: "2028-02-25" },
  { start: "2029-01-16", end: "2029-02-13" },
  { start: "2030-01-05", end: "2030-02-03" },
  { start: "2030-12-26", end: "2031-01-23" },
  { start: "2031-12-16", end: "2032-01-13" },
  { start: "2032-12-04", end: "2033-01-02" },
  { start: "2033-11-23", end: "2033-12-22" },
  { start: "2034-11-12", end: "2034-12-11" },
  { start: "2035-11-01", end: "2035-11-30" },
  { start: "2036-10-21", end: "2036-11-18" },
  { start: "2037-10-10", end: "2037-11-08" },
  { start: "2038-09-30", end: "2038-10-28" },
  { start: "2039-09-19", end: "2039-10-18" },
  { start: "2040-09-08", end: "2040-10-06" },
];

// Sacred months: Muharram (1), Rajab (7), Dhul-Qa'dah (11), Dhul-Hijjah (12).
// Consecutive months merged where they meet (Dhul-Qa'dah → Dhul-Hijjah → Muharram).
export const SACRED_MONTH_RANGES: readonly DateRange[] = [
  { start: "2024-07-07", end: "2024-08-04" },
  { start: "2025-01-01", end: "2025-01-30" },
  { start: "2025-04-29", end: "2025-07-25" },
  { start: "2025-12-21", end: "2026-01-19" },
  { start: "2026-04-18", end: "2026-07-14" },
  { start: "2026-12-10", end: "2027-01-08" },
  { start: "2027-04-08", end: "2027-07-04" },
  { start: "2027-11-29", end: "2027-12-28" },
  { start: "2028-03-27", end: "2028-06-23" },
  { start: "2028-11-18", end: "2028-12-16" },
  { start: "2029-03-16", end: "2029-06-12" },
  { start: "2029-11-08", end: "2029-12-06" },
  { start: "2030-03-06", end: "2030-06-02" },
  { start: "2030-10-28", end: "2030-11-26" },
  { start: "2031-02-23", end: "2031-05-22" },
  { start: "2031-10-18", end: "2031-11-15" },
  { start: "2032-02-12", end: "2032-05-10" },
  { start: "2032-10-06", end: "2032-11-04" },
  { start: "2033-02-01", end: "2033-04-29" },
  { start: "2033-09-25", end: "2033-10-24" },
  { start: "2034-01-22", end: "2034-04-19" },
  { start: "2034-09-14", end: "2034-10-13" },
  { start: "2035-01-11", end: "2035-04-09" },
  { start: "2035-09-03", end: "2035-10-02" },
  { start: "2035-12-31", end: "2036-03-28" },
  { start: "2036-08-23", end: "2036-09-20" },
  { start: "2036-12-19", end: "2037-03-17" },
  { start: "2037-08-13", end: "2037-09-10" },
  { start: "2037-12-08", end: "2038-03-06" },
  { start: "2038-08-02", end: "2038-08-31" },
  { start: "2038-11-28", end: "2039-02-23" },
  { start: "2039-07-22", end: "2039-08-20" },
  { start: "2039-11-18", end: "2040-02-13" },
  { start: "2040-07-11", end: "2040-08-08" },
  { start: "2040-11-06", end: "2041-02-01" },
];

function inRange(dateKey: string, range: DateRange): boolean {
  return dateKey >= range.start && dateKey <= range.end;
}

export function isInRamadan(dateKey: string): boolean {
  return RAMADAN_RANGES.some((r) => inRange(dateKey, r));
}

export function isInSacredMonth(dateKey: string): boolean {
  return SACRED_MONTH_RANGES.some((r) => inRange(dateKey, r));
}

export function ramadanRangeContaining(dateKey: string): DateRange | null {
  return RAMADAN_RANGES.find((r) => inRange(dateKey, r)) ?? null;
}

export function enumerateDates(range: DateRange): string[] {
  const out: string[] = [];
  const [sy, sm, sd] = range.start.split("-").map(Number);
  const [ey, em, ed] = range.end.split("-").map(Number);
  const startMs = Date.UTC(sy, sm - 1, sd);
  const endMs = Date.UTC(ey, em - 1, ed);
  for (let t = startMs; t <= endMs; t += 86_400_000) {
    const d = new Date(t);
    const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${d.getUTCDate()}`.padStart(2, "0");
    out.push(`${d.getUTCFullYear()}-${m}-${day}`);
  }
  return out;
}

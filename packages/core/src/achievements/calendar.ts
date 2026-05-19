export interface DateRange {
  end: string;
  start: string;
}

// Approximate Gregorian ranges. Actual dates depend on local moon sighting.
// Tolerance of one day either side is expected.
export const RAMADAN_RANGES: readonly DateRange[] = [
  { start: "2025-03-01", end: "2025-03-29" },
  { start: "2026-02-18", end: "2026-03-19" },
  { start: "2027-02-08", end: "2027-03-08" },
  { start: "2028-01-28", end: "2028-02-25" },
  { start: "2029-01-16", end: "2029-02-14" },
];

export const SACRED_MONTH_RANGES: readonly DateRange[] = [
  { start: "2024-07-07", end: "2024-08-04" },
  { start: "2025-01-01", end: "2025-01-30" },
  { start: "2025-04-29", end: "2025-06-26" },
  { start: "2025-06-26", end: "2025-07-25" },
  { start: "2025-12-22", end: "2026-01-19" },
  { start: "2026-04-18", end: "2026-06-15" },
  { start: "2026-06-16", end: "2026-07-14" },
  { start: "2026-12-11", end: "2027-01-09" },
  { start: "2027-04-07", end: "2027-06-04" },
  { start: "2027-06-05", end: "2027-07-04" },
  { start: "2027-11-30", end: "2027-12-29" },
  { start: "2028-03-27", end: "2028-05-24" },
  { start: "2028-05-25", end: "2028-06-22" },
  { start: "2028-11-18", end: "2028-12-17" },
  { start: "2029-03-16", end: "2029-05-13" },
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

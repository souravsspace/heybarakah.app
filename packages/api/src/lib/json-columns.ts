/**
 * Safe JSON helpers for hand-rolled blobs (KV cache values, webhook payloads).
 * Drizzle's `text({ mode: "json" })` columns already parse/stringify themselves;
 * these are for the raw boundaries where we read/write JSON outside the ORM.
 */
export function stringifyJson(value: unknown): string {
  return JSON.stringify(value);
}

export function parseJson<T>(raw: string | null | undefined): T | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Convex → D1 backfill transforms (§10). Pure + tested; the actual run is a
 * deferred manual step (needs `npx convex export` + a created prod D1 +
 * `wrangler login`) — see `backfill.ts`.
 *
 * The #1 invariant (Risks §): **`authUserId` is preserved verbatim** on every
 * row so each user's data graph still resolves after the cutover. Convex
 * bookkeeping fields (`_id`, `_creationTime`) are dropped; a fresh uuid `id` is
 * minted for app tables (they key on `authUserId`, not their own id). Better
 * Auth identity tables (`user`/`account`/`session`) are imported FIRST and keep
 * their original ids — that id *is* the `authUserId` everything else references.
 */

/** A raw Convex document as it appears in an export JSONL line. */
export type ConvexDoc = Record<string, unknown> & {
  _creationTime?: number;
  _id?: string;
};

/**
 * Import order: identity first (ids), then profiles, then user-keyed data.
 * Intentionally skipped: `emailQueue` (transient — in-flight Convex emails are
 * not carried over; re-trigger sends post-cutover if needed) and
 * `prayerTimeCaches` (recomputed on demand from the first refresh request).
 */
export const BACKFILL_ORDER = [
  "user",
  "account",
  "session",
  "verification",
  "users",
  "subscriptions",
  "polarOrders",
  "prayerLogs",
  "shieldSelection",
  "dhikrDaily",
  "dhikrAggregate",
  "userLocations",
  "userAchievements",
  "userAchievementCounters",
  "appConfig",
] as const;

export type BackfillTable = (typeof BACKFILL_ORDER)[number];

/** Tables whose original Convex id must be preserved (Better Auth identity). */
const PRESERVE_ID = new Set<BackfillTable>([
  "user",
  "account",
  "session",
  "verification",
]);

function newId(): string {
  return crypto.randomUUID();
}

/**
 * Map a Convex doc to a flat D1 row. Strips Convex-internal fields, resolves the
 * primary key per table policy, and serializes object/array values to JSON
 * strings (D1 has no native JSON type; the Drizzle `mode:"json"` columns parse
 * them back). `authUserId` (and any other scalar) passes through untouched.
 */
export function toD1Row(
  table: BackfillTable,
  doc: ConvexDoc,
  idFactory: () => string = newId
): Record<string, unknown> {
  const { _id, _creationTime, ...rest } = doc;
  const row: Record<string, unknown> = {};

  row.id = PRESERVE_ID.has(table) ? (_id ?? idFactory()) : idFactory();

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) {
      continue;
    }
    row[key] =
      value !== null && typeof value === "object"
        ? JSON.stringify(value)
        : value;
  }
  return row;
}

/** Escape a JS value as a SQLite literal for a generated INSERT statement. */
export function toSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Build a single multi-row INSERT for a table's transformed rows. */
export function toInsertSql(
  table: BackfillTable,
  rows: Record<string, unknown>[]
): string {
  if (rows.length === 0) {
    return "";
  }
  // `toD1Row` omits undefined-valued keys, so rows of the same table can have
  // different column sets. Build the union of keys in first-seen order across
  // ALL rows (id stays first) so every row's values align to the same columns;
  // a missing key resolves to `undefined` → `NULL` via `toSqlLiteral`.
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  const values = rows
    .map((row) => `(${columns.map((c) => toSqlLiteral(row[c])).join(", ")})`)
    .join(",\n");
  return `INSERT INTO "${table}" (${columns
    .map((c) => `"${c}"`)
    .join(", ")}) VALUES\n${values};`;
}

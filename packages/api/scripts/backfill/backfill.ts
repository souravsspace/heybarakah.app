/**
 * Convex → D1 backfill runner (§10) — DEFERRED MANUAL STEP.
 *
 * Prerequisites (none available in CI / this session):
 *   1. `npx convex export --path convex-export.zip` from `packages/core`, unzip.
 *      App tables land at `<dir>/<table>/documents.jsonl`. The Better Auth
 *      identity tables (`user`/`account`/`session`/`verification`) live in the
 *      `@convex-dev/better-auth` component namespace — export them too and place
 *      their JSONL under the same names.
 *   2. A created prod D1 + `wrangler login`.
 *
 * Usage:
 *   bun run scripts/backfill/backfill.ts <exportDir> <outDir>
 *   # then, after reviewing the SQL:
 *   wrangler d1 execute <DB> --remote --file <outDir>/backfill.sql
 *
 * Emits one ordered `backfill.sql` (identity first; see BACKFILL_ORDER) so the
 * authUserId continuity invariant holds. Idempotency: run against a freshly
 * migrated, empty D1 — re-running would duplicate rows.
 */

import {
  BACKFILL_ORDER,
  type ConvexDoc,
  toD1Row,
  toInsertSql,
} from "./transform";

async function readDocs(
  exportDir: string,
  table: string
): Promise<ConvexDoc[]> {
  const path = `${exportDir}/${table}/documents.jsonl`;
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return [];
  }
  const text = await file.text();
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as ConvexDoc);
}

async function main(): Promise<void> {
  const [exportDir, outDir] = Bun.argv.slice(2);
  if (!(exportDir && outDir)) {
    process.stderr.write(
      "usage: bun run scripts/backfill/backfill.ts <exportDir> <outDir>\n"
    );
    process.exit(1);
  }

  const blocks: string[] = [];
  for (const table of BACKFILL_ORDER) {
    const docs = await readDocs(exportDir, table);
    const rows = docs.map((doc) => toD1Row(table, doc));
    const sql = toInsertSql(table, rows);
    if (sql) {
      blocks.push(`-- ${table}: ${rows.length} rows\n${sql}`);
    }
    process.stdout.write(`${table}: ${rows.length} rows\n`);
  }

  await Bun.write(`${outDir}/backfill.sql`, `${blocks.join("\n\n")}\n`);
  process.stdout.write(`\nwrote ${outDir}/backfill.sql\n`);
}

main().catch((error) => {
  process.stderr.write(`backfill failed: ${String(error)}\n`);
  process.exit(1);
});

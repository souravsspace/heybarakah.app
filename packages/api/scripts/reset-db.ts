import { getTableName } from "drizzle-orm";

import { schema } from "@/db/schema";

export const APP_TABLE_NAMES = Object.values(schema).map((table) =>
  getTableName(table)
);

export interface ResetArgs {
  help: boolean;
  remote: boolean;
}

export function parseResetArgs(argv: string[]): ResetArgs {
  return {
    remote: argv.includes("--remote"),
    help: argv.includes("--help") || argv.includes("-h"),
  };
}

export function buildClearStatements(
  tables: readonly string[] = APP_TABLE_NAMES
): string[] {
  return tables.map((table) => `DELETE FROM \`${table}\`;`);
}

function usage(): string {
  return [
    "Clear every app table in the D1 database.",
    "",
    "Usage:",
    "  bun run scripts/reset-db.ts            # local miniflare D1",
    "  bun run scripts/reset-db.ts --remote   # remote D1 (careful)",
  ].join("\n");
}

async function main() {
  const args = parseResetArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const { $ } = await import("bun");
  const sqlCommand = buildClearStatements().join(" ");
  const target = args.remote ? "--remote" : "--local";
  await $`wrangler d1 execute DB ${target} --command ${sqlCommand}`;
}

if (import.meta.main) {
  await main();
}

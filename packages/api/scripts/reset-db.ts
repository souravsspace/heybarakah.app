import { getTableName } from "drizzle-orm";

import { schema } from "@/db/schema";

export const APP_TABLE_NAMES = Object.values(schema).map((table) =>
  getTableName(table)
);

export interface ResetArgs {
  env?: string;
  help: boolean;
  remote: boolean;
  yes: boolean;
}

/** Env names that must never be wiped via `--remote`, even with `--yes`. */
const PROD_ENV_NAMES = new Set(["production", "prod"]);

export function parseResetArgs(argv: string[]): ResetArgs {
  const envFlag = argv.indexOf("--env");
  return {
    remote: argv.includes("--remote"),
    help: argv.includes("--help") || argv.includes("-h"),
    yes: argv.includes("--yes"),
    env: envFlag === -1 ? undefined : argv[envFlag + 1],
  };
}

/**
 * Guard the destructive `--remote` path. Local resets are unguarded. A remote
 * reset requires an explicit `--yes` AND an explicit, non-production `--env`.
 * Returns an error message when refused, or `null` when the reset may proceed.
 */
export function checkRemoteGuard(args: ResetArgs): string | null {
  if (!args.remote) {
    return null;
  }
  if (!args.yes) {
    return "Refusing remote reset: pass --yes to confirm this destructive operation.";
  }
  if (!args.env) {
    return "Refusing remote reset: pass --env <name> to name the target environment.";
  }
  if (PROD_ENV_NAMES.has(args.env.toLowerCase())) {
    return `Refusing remote reset: --env "${args.env}" is a production environment.`;
  }
  return null;
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
    "  bun run scripts/reset-db.ts                              # local miniflare D1",
    "  bun run scripts/reset-db.ts --remote --yes --env <name>  # remote D1 (non-prod only)",
    "",
    "A remote reset is destructive and requires --yes and an explicit, non-production --env.",
  ].join("\n");
}

async function main() {
  const args = parseResetArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const refusal = checkRemoteGuard(args);
  if (refusal) {
    process.stderr.write(`${refusal}\n`);
    process.exit(1);
  }

  const where = args.remote ? `remote (--env ${args.env})` : "local miniflare";
  process.stdout.write(`Resetting D1 (DB binding) target: ${where}\n`);

  const { $ } = await import("bun");
  // `wrangler d1 execute --command` runs only ONE statement; everything after
  // the first `;` is silently dropped. Write all statements to a temp .sql file
  // and run with --file so every table is cleared.
  const sqlFile = `${process.cwd()}/.reset-db.tmp.sql`;
  await Bun.write(sqlFile, `${buildClearStatements().join("\n")}\n`);
  const target = args.remote ? "--remote" : "--local";
  try {
    await (args.remote
      ? $`wrangler d1 execute DB ${target} --env ${args.env} --file ${sqlFile}`
      : $`wrangler d1 execute DB ${target} --file ${sqlFile}`);
  } finally {
    await Bun.file(sqlFile)
      .unlink()
      .catch(() => undefined);
  }
}

if (import.meta.main) {
  await main();
}

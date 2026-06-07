import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { schema } from "@/db/schema";

export function createDatabase(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

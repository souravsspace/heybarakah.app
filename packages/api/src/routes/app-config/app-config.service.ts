import { eq } from "drizzle-orm";

import type { Database } from "@/db";
import { appConfig } from "@/db/schema";

export interface AppConfigInput {
  iosStoreUrl: string;
  minSupportedVersion: string;
}

export interface AppConfigPublic {
  iosStoreUrl: string;
  minSupportedVersion: string;
}

/** Ports convex/lib/appConfig.ts `getAppConfig`: the single config row, or null. */
export async function getAppConfig(
  db: Database
): Promise<AppConfigPublic | null> {
  const [row] = await db.select().from(appConfig).limit(1);
  if (!row) {
    return null;
  }
  return {
    minSupportedVersion: row.minSupportedVersion,
    iosStoreUrl: row.iosStoreUrl,
  };
}

/**
 * Ports `setAppConfig` (internalMutation): upsert the single config row.
 * Returns the row id. Internal — not HTTP-exposed.
 */
export async function setAppConfig(
  db: Database,
  args: AppConfigInput
): Promise<string> {
  const updatedAt = Date.now();
  const [existing] = await db
    .select({ id: appConfig.id })
    .from(appConfig)
    .limit(1);

  if (existing) {
    await db
      .update(appConfig)
      .set({ ...args, updatedAt })
      .where(eq(appConfig.id, existing.id));
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.insert(appConfig).values({ id, ...args, updatedAt });
  return id;
}

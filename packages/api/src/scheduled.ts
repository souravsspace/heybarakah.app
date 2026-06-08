import { createDatabase } from "@/db";
import { sweepEmailQueue } from "@/lib/resend";
import { purgeExpiredPrayerCaches } from "@/routes/prayer-times/prayer-times.service";
import type { AppBindings } from "@/types/app-type";

export interface SweepResult {
  emailsProcessed: number;
  prayerCachesPurged: number;
}

/**
 * Workers cron entrypoint. Drives the durable email queue (delivery + retry,
 * §6) and evicts expired prayer-time cache rows (§5). Both are idempotent and
 * safe to run on overlapping ticks.
 */
export async function handleScheduled(
  env: AppBindings["Bindings"]
): Promise<SweepResult> {
  const db = createDatabase(env.DB);
  const emailsProcessed = await sweepEmailQueue(db, env, { limit: 25 });
  const prayerCachesPurged = await purgeExpiredPrayerCaches(db);
  return { emailsProcessed, prayerCachesPurged };
}

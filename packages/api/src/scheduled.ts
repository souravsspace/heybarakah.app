import { createDatabase } from "@/db";
import { parseEnv } from "@/env";
import { sweepEmailQueue } from "@/lib/resend";
import { createLogger } from "@/middlewares/logger";
import { purgeExpiredPrayerCaches } from "@/routes/prayer-times/prayer-times.service";
import type { AppBindings } from "@/types/app-type";

export interface SweepResult {
  emailsProcessed: number;
  prayerCachesPurged: number;
}

/**
 * Workers cron entrypoint. Drives the durable email queue (delivery + retry,
 * §6) and evicts expired prayer-time cache rows (§5). Both are idempotent and
 * safe to run on overlapping ticks. Each task is isolated so a throw in one
 * never starves the other; failures are logged and the handler still resolves.
 */
export async function handleScheduled(
  env: AppBindings["Bindings"]
): Promise<SweepResult> {
  const db = createDatabase(env.DB);
  const log = createLogger(crypto.randomUUID());

  // The request path Zod-validates env on every call; the cron path skipped it,
  // so a missing secret (e.g. RESEND_API_KEY) only surfaced as per-row send
  // failures that burned the retry budget. Surface misconfiguration loudly here
  // instead — but still run both sweeps (the cache purge needs no secrets).
  try {
    parseEnv(env);
  } catch (error) {
    log.error("scheduled: env validation failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  let emailsProcessed = 0;
  try {
    emailsProcessed = await sweepEmailQueue(db, env, { limit: 25 });
  } catch (error) {
    log.error("scheduled: sweepEmailQueue failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  let prayerCachesPurged = 0;
  try {
    prayerCachesPurged = await purgeExpiredPrayerCaches(db);
  } catch (error) {
    log.error("scheduled: purgeExpiredPrayerCaches failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return { emailsProcessed, prayerCachesPurged };
}

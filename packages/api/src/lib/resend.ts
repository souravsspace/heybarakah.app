import { and, eq, lte } from "drizzle-orm";
import { Resend } from "resend";

import type { Database } from "@/db";
import { emailQueue } from "@/db/schema";
import type { EnvVars } from "@/env";

/** Give up after this many failed delivery attempts. */
export const MAX_EMAIL_ATTEMPTS = 5;
/** Exponential backoff base; attempt n waits BASE * 2^(n-1). */
const BACKOFF_BASE_MS = 60_000;

type QueueRow = typeof emailQueue.$inferSelect;

export interface EmailMessage {
  /** Optional idempotency key — a duplicate enqueue with the same key is a no-op. */
  dedupeKey?: string;
  html: string;
  subject: string;
  text?: string;
  to: string;
}

/**
 * Low-level Resend send. Throws on a missing key or a provider error so the
 * queue records the failure and retries. Returns the provider email id.
 */
export async function sendViaResend(
  env: EnvVars,
  message: EmailMessage
): Promise<string> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_AUTH_EMAIL ?? env.RESEND_FROM;
  if (!(apiKey && from)) {
    throw new Error("RESEND_API_KEY and a from address are required");
  }
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: env.RESEND_REPLY_TO,
  });
  if (error) {
    throw new Error(error.message ?? "Resend send failed");
  }
  if (!data?.id) {
    throw new Error("Resend returned no email id");
  }
  return data.id;
}

/**
 * Enqueue a transactional email for durable delivery. Idempotent on `dedupeKey`:
 * a second enqueue with the same key returns the existing row id without adding
 * a duplicate (webhook retries are common).
 */
export async function enqueueEmail(
  db: Database,
  message: EmailMessage
): Promise<string> {
  if (message.dedupeKey) {
    const [existing] = await db
      .select({ id: emailQueue.id })
      .from(emailQueue)
      .where(eq(emailQueue.dedupeKey, message.dedupeKey))
      .limit(1);
    if (existing) {
      return existing.id;
    }
  }

  const now = Date.now();
  const id = crypto.randomUUID();
  await db.insert(emailQueue).values({
    id,
    dedupeKey: message.dedupeKey ?? null,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text ?? null,
    status: "queued",
    attempts: 0,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

/**
 * Attempt delivery of one queued row. On success → `sent`. On failure →
 * `attempts` increments; the row stays `queued` with an exponential-backoff
 * `nextAttemptAt` until `MAX_EMAIL_ATTEMPTS`, then flips to `failed`.
 */
export async function processQueueRow(
  db: Database,
  env: EnvVars,
  row: QueueRow
): Promise<void> {
  const now = Date.now();
  try {
    const providerId = await sendViaResend(env, {
      to: row.to,
      subject: row.subject,
      html: row.html,
      text: row.text ?? undefined,
    });
    await db
      .update(emailQueue)
      .set({ status: "sent", providerId, sentAt: now, updatedAt: now })
      .where(eq(emailQueue.id, row.id));
  } catch (error) {
    const attempts = row.attempts + 1;
    const givingUp = attempts >= MAX_EMAIL_ATTEMPTS;
    await db
      .update(emailQueue)
      .set({
        status: givingUp ? "failed" : "queued",
        attempts,
        lastError: error instanceof Error ? error.message : String(error),
        nextAttemptAt: now + BACKOFF_BASE_MS * 2 ** (attempts - 1),
        updatedAt: now,
      })
      .where(eq(emailQueue.id, row.id));
  }
}

/**
 * Process all `queued` rows whose `nextAttemptAt` is due. Driven by a Workers
 * cron trigger (§9). Returns the number of rows processed.
 */
export async function sweepEmailQueue(
  db: Database,
  env: EnvVars,
  options: { limit?: number; now?: number } = {}
): Promise<number> {
  const now = options.now ?? Date.now();
  const rows = await db
    .select()
    .from(emailQueue)
    .where(
      and(eq(emailQueue.status, "queued"), lte(emailQueue.nextAttemptAt, now))
    )
    .orderBy(emailQueue.nextAttemptAt)
    .limit(options.limit ?? 10);

  for (const row of rows) {
    await processQueueRow(db, env, row);
  }
  return rows.length;
}

import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { createDatabase } from "@/db";
import { emailQueue } from "@/db/schema";
import {
  enqueueEmail,
  MAX_EMAIL_ATTEMPTS,
  processQueueRow,
  sweepEmailQueue,
} from "@/lib/resend";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

const baseEnv = {
  RESEND_API_KEY: "re_test",
  RESEND_AUTH_EMAIL: "Barakah <no-reply@heybarakah.app>",
} as never;

const msg = {
  to: "user@example.com",
  subject: "Receipt",
  html: "<p>thanks</p>",
  text: "thanks",
};

beforeEach(() => sendMock.mockReset());

describe("enqueueEmail", () => {
  it("inserts a queued row", async () => {
    const db = createDatabase(env.DB);
    const id = await enqueueEmail(db, { ...msg, to: "a@x.com" });
    const [row] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    expect(row.status).toBe("queued");
    expect(row.attempts).toBe(0);
  });

  it("is idempotent on dedupeKey (no double enqueue)", async () => {
    const db = createDatabase(env.DB);
    const first = await enqueueEmail(db, { ...msg, dedupeKey: "order-1" });
    const second = await enqueueEmail(db, { ...msg, dedupeKey: "order-1" });
    expect(second).toBe(first);

    // The atomic upsert returns the existing id without creating a second row.
    const rows = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.dedupeKey, "order-1"));
    expect(rows).toHaveLength(1);
  });

  it("always inserts keyless (null dedupeKey) emails", async () => {
    const db = createDatabase(env.DB);
    const a = await enqueueEmail(db, { ...msg, to: "k1@x.com" });
    const b = await enqueueEmail(db, { ...msg, to: "k2@x.com" });
    expect(a).not.toBe(b);
  });
});

describe("processQueueRow", () => {
  it("marks a row sent on success", async () => {
    const db = createDatabase(env.DB);
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    const id = await enqueueEmail(db, { ...msg, to: "ok@x.com" });
    const [row] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));

    await processQueueRow(db, baseEnv, row);
    const [after] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    expect(after.status).toBe("sent");
    expect(after.providerId).toBe("email_1");
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("retries on failure, then gives up after the max attempts", async () => {
    const db = createDatabase(env.DB);
    sendMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const id = await enqueueEmail(db, { ...msg, to: "fail@x.com" });

    for (let i = 0; i < MAX_EMAIL_ATTEMPTS; i++) {
      const [row] = await db
        .select()
        .from(emailQueue)
        .where(eq(emailQueue.id, id));
      await processQueueRow(db, baseEnv, row);
    }
    const [after] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    expect(after.status).toBe("failed");
    expect(after.attempts).toBe(MAX_EMAIL_ATTEMPTS);
    expect(after.lastError).toContain("boom");
  });
});

describe("sweepEmailQueue", () => {
  it("processes due queued rows and skips ones scheduled for later", async () => {
    const db = createDatabase(env.DB);
    sendMock.mockResolvedValue({ data: { id: "swept" }, error: null });
    const due = await enqueueEmail(db, { ...msg, to: "due@x.com" });
    // A row scheduled in the future must not be picked up.
    const later = await enqueueEmail(db, { ...msg, to: "later@x.com" });
    await db
      .update(emailQueue)
      .set({ nextAttemptAt: Date.now() + 3_600_000 })
      .where(eq(emailQueue.id, later));

    const processed = await sweepEmailQueue(db, baseEnv, { limit: 10 });
    expect(processed).toBeGreaterThanOrEqual(1);

    const [dueRow] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, due));
    const [laterRow] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, later));
    expect(dueRow.status).toBe("sent");
    expect(laterRow.status).toBe("queued");
  });
});

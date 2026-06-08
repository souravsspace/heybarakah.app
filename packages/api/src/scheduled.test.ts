import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
    constructor(_apiKey: string) {
      // no-op
    }
  },
}));

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import migration0001 from "@/db/migrations/0001_legal_solo.sql?raw";
import migration0002 from "@/db/migrations/0002_smiling_johnny_blaze.sql?raw";
import { emailQueue } from "@/db/schema";
import { enqueueEmail } from "@/lib/resend";
import { handleScheduled } from "@/scheduled";

async function applyMigrations() {
  for (const sql of [migration0000, migration0001, migration0002]) {
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await env.DB.prepare(statement).run();
    }
  }
}

beforeAll(applyMigrations);
beforeEach(() => sendMock.mockReset());

describe("handleScheduled", () => {
  it("sweeps the email queue and reports counts", async () => {
    sendMock.mockResolvedValue({ data: { id: "cron_send" }, error: null });
    const db = createDatabase(env.DB);
    const id = await enqueueEmail(db, {
      to: "cron@x.com",
      subject: "s",
      html: "<p>h</p>",
    });

    const result = await handleScheduled(
      env as unknown as Parameters<typeof handleScheduled>[0]
    );
    expect(result.emailsProcessed).toBeGreaterThanOrEqual(1);

    const [row] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    expect(row.status).toBe("sent");
  });
});

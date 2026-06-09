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
import { enqueueEmail } from "@/lib/resend";
import { handleScheduled } from "@/scheduled";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

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

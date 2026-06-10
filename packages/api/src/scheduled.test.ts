import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

// Wrap the two scheduled tasks so individual tests can force one to throw and
// assert the other still runs. By default both delegate to the captured real
// impl (`actual*`), so the default path never recurses through the mock.
const { sweepMock, purgeMock, actual } = vi.hoisted(() => ({
  sweepMock: vi.fn(),
  purgeMock: vi.fn(),
  actual: {} as {
    sweepEmailQueue?: typeof import("@/lib/resend").sweepEmailQueue;
    purgeExpiredPrayerCaches?: typeof import("@/routes/prayer-times/prayer-times.service").purgeExpiredPrayerCaches;
  },
}));

vi.mock("@/lib/resend", async (importActual) => {
  const real = await importActual<typeof import("@/lib/resend")>();
  actual.sweepEmailQueue = real.sweepEmailQueue;
  return {
    ...real,
    sweepEmailQueue: (...args: Parameters<typeof real.sweepEmailQueue>) =>
      sweepMock(...args),
  };
});

vi.mock("@/routes/prayer-times/prayer-times.service", async (importActual) => {
  const real =
    await importActual<
      typeof import("@/routes/prayer-times/prayer-times.service")
    >();
  actual.purgeExpiredPrayerCaches = real.purgeExpiredPrayerCaches;
  return {
    ...real,
    purgeExpiredPrayerCaches: (
      ...args: Parameters<typeof real.purgeExpiredPrayerCaches>
    ) => purgeMock(...args),
  };
});

import { createDatabase } from "@/db";
import { emailQueue } from "@/db/schema";
import { enqueueEmail } from "@/lib/resend";
import { handleScheduled } from "@/scheduled";
import { applyMigrations } from "@/test-support/apply-migrations";

applyMigrations();

beforeEach(() => {
  sendMock.mockReset();
  // Reset both tasks to the real impl before each test; isolation cases override.
  sweepMock
    .mockReset()
    .mockImplementation(
      (...args: Parameters<NonNullable<typeof actual.sweepEmailQueue>>) =>
        // biome-ignore lint/style/noNonNullAssertion: set by the mock factory above
        actual.sweepEmailQueue!(...args)
    );
  purgeMock
    .mockReset()
    .mockImplementation(
      (
        ...args: Parameters<NonNullable<typeof actual.purgeExpiredPrayerCaches>>
      ) =>
        // biome-ignore lint/style/noNonNullAssertion: set by the mock factory above
        actual.purgeExpiredPrayerCaches!(...args)
    );
});

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

  it("still purges prayer caches when the email sweep throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    sweepMock.mockRejectedValue(new Error("sweep boom"));
    purgeMock.mockResolvedValue(7);

    const result = await handleScheduled(
      env as unknown as Parameters<typeof handleScheduled>[0]
    );

    // The failing task is isolated (0) but the other still ran.
    expect(result.emailsProcessed).toBe(0);
    expect(result.prayerCachesPurged).toBe(7);
    expect(purgeMock).toHaveBeenCalledTimes(1);
  });

  it("still sweeps emails when the prayer-cache purge throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    sweepMock.mockResolvedValue(3);
    purgeMock.mockRejectedValue(new Error("purge boom"));

    const result = await handleScheduled(
      env as unknown as Parameters<typeof handleScheduled>[0]
    );

    expect(result.emailsProcessed).toBe(3);
    expect(result.prayerCachesPurged).toBe(0);
    expect(sweepMock).toHaveBeenCalledTimes(1);
  });
});

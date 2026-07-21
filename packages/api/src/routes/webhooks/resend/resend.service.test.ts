import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { emailQueue } from "@/db/schema";
import { applyMigrations } from "@/test-support/apply-migrations";

import {
  applyEmailEvent,
  type SvixHeaders,
  verifyResendSignature,
} from "./resend.service";

applyMigrations();

const RAW_SECRET_B64 = btoa("super-secret-signing-key-0123456789");
const SECRET = `whsec_${RAW_SECRET_B64}`;

function bytesFromB64(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function sign(
  id: string,
  timestamp: string,
  body: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    bytesFromB64(RAW_SECRET_B64),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${id}.${timestamp}.${body}`)
  );
  return btoa(String.fromCharCode(...new Uint8Array(mac)));
}

describe("verifyResendSignature", () => {
  const nowTs = () => Math.floor(Date.now() / 1000).toString();

  it("accepts a correctly signed, in-window payload", async () => {
    const id = "msg_1";
    const ts = nowTs();
    const body = JSON.stringify({ type: "email.delivered" });
    const sig = await sign(id, ts, body);
    const headers: SvixHeaders = { id, timestamp: ts, signature: `v1,${sig}` };

    expect(await verifyResendSignature(SECRET, headers, body)).toBe(true);
  });

  it("accepts when any of several space-separated candidates matches", async () => {
    const id = "msg_2";
    const ts = nowTs();
    const body = "{}";
    const good = await sign(id, ts, body);
    const headers: SvixHeaders = {
      id,
      timestamp: ts,
      signature: `v1,AAAA v1,${good}`,
    };
    expect(await verifyResendSignature(SECRET, headers, body)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const id = "msg_3";
    const ts = nowTs();
    const sig = await sign(id, ts, "{}");
    const headers: SvixHeaders = { id, timestamp: ts, signature: `v1,${sig}` };
    expect(await verifyResendSignature(SECRET, headers, "{tampered}")).toBe(
      false
    );
  });

  it("rejects a stale timestamp beyond the replay window", async () => {
    const id = "msg_4";
    const oldTs = (Math.floor(Date.now() / 1000) - 10_000).toString();
    const body = "{}";
    const sig = await sign(id, oldTs, body);
    const headers: SvixHeaders = {
      id,
      timestamp: oldTs,
      signature: `v1,${sig}`,
    };
    expect(await verifyResendSignature(SECRET, headers, body)).toBe(false);
  });

  it("rejects a non-numeric timestamp", async () => {
    const headers: SvixHeaders = {
      id: "x",
      timestamp: "not-a-number",
      signature: "v1,AAAA",
    };
    expect(await verifyResendSignature(SECRET, headers, "{}")).toBe(false);
  });

  it("does not throw on non-base64 signature junk — returns false", async () => {
    const ts = nowTs();
    const headers: SvixHeaders = {
      id: "x",
      timestamp: ts,
      signature: "v1,@@not-base64@@",
    };
    expect(await verifyResendSignature(SECRET, headers, "{}")).toBe(false);
  });
});

describe("applyEmailEvent", () => {
  async function seedSent(providerId: string): Promise<string> {
    const db = createDatabase(env.DB);
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.insert(emailQueue).values({
      id,
      to: "x@y.com",
      subject: "s",
      html: "<p>h</p>",
      status: "sent",
      attempts: 1,
      providerId,
      nextAttemptAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }

  async function statusOf(id: string): Promise<string> {
    const db = createDatabase(env.DB);
    const rows = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    return rows[0].status;
  }

  it("flips the row to failed on a bounce", async () => {
    const db = createDatabase(env.DB);
    const provider = `p_${crypto.randomUUID()}`;
    const id = await seedSent(provider);
    await applyEmailEvent(db, "email.bounced", provider);
    expect(await statusOf(id)).toBe("failed");
  });

  it("flips the row to failed on a complaint", async () => {
    const db = createDatabase(env.DB);
    const provider = `p_${crypto.randomUUID()}`;
    const id = await seedSent(provider);
    await applyEmailEvent(db, "email.complained", provider);
    expect(await statusOf(id)).toBe("failed");
  });

  it("leaves the row untouched on a soft/delivery event", async () => {
    const db = createDatabase(env.DB);
    const provider = `p_${crypto.randomUUID()}`;
    const id = await seedSent(provider);
    await applyEmailEvent(db, "email.delivered", provider);
    expect(await statusOf(id)).toBe("sent");
  });

  it("no-ops on an empty email id", async () => {
    const db = createDatabase(env.DB);
    await expect(
      applyEmailEvent(db, "email.bounced", "")
    ).resolves.toBeUndefined();
  });
});

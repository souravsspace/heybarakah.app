import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import migration0000 from "@/db/migrations/0000_swift_mojo.sql?raw";
import migration0001 from "@/db/migrations/0001_legal_solo.sql?raw";
import migration0002 from "@/db/migrations/0002_smiling_johnny_blaze.sql?raw";
import { emailQueue } from "@/db/schema";
import { createApp } from "@/lib/create-app";

import { resendWebhook } from "./resend.index";
import { verifyResendSignature } from "./resend.service";

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

function post(body: unknown) {
  return new Request("http://localhost/webhooks/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function appWith() {
  const app = createApp();
  app.route("/", resendWebhook);
  return app;
}

// Sign exactly like the service so the verifier round-trips against a known key.
async function svixSign(
  secret: string,
  id: string,
  timestamp: string,
  body: string
): Promise<string> {
  const raw = secret.slice(6);
  const bytes = Uint8Array.from(atob(raw), (ch) => ch.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${id}.${timestamp}.${body}`)
  );
  return `v1,${btoa(String.fromCharCode(...new Uint8Array(mac)))}`;
}

beforeAll(applyMigrations);

describe("verifyResendSignature", () => {
  const secret = `whsec_${btoa("supersecretkey")}`;

  it("accepts a correctly signed payload", async () => {
    const body = '{"type":"email.delivered"}';
    const sig = await svixSign(secret, "msg_1", "171", body);
    expect(
      await verifyResendSignature(
        secret,
        { id: "msg_1", timestamp: "171", signature: sig },
        body
      )
    ).toBe(true);
  });

  it("rejects a tampered payload", async () => {
    const sig = await svixSign(secret, "msg_1", "171", "{}");
    expect(
      await verifyResendSignature(
        secret,
        { id: "msg_1", timestamp: "171", signature: sig },
        '{"tampered":true}'
      )
    ).toBe(false);
  });
});

describe("resend webhook", () => {
  it("flips a queue row to failed on a bounce", async () => {
    const id = await seedSent("re_bounce_1");
    const res = await appWith().request(
      post({ type: "email.bounced", data: { email_id: "re_bounce_1" } }),
      undefined,
      env
    );
    expect(res.status).toBe(200);

    const db = createDatabase(env.DB);
    const [row] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    expect(row.status).toBe("failed");
    expect(row.lastError).toBe("email.bounced");
  });

  it("leaves a delivered row untouched", async () => {
    const id = await seedSent("re_ok_1");
    const res = await appWith().request(
      post({ type: "email.delivered", data: { email_id: "re_ok_1" } }),
      undefined,
      env
    );
    expect(res.status).toBe(200);

    const db = createDatabase(env.DB);
    const [row] = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.id, id));
    expect(row.status).toBe("sent");
  });

  it("400s on a malformed body", async () => {
    const res = await appWith().request(
      new Request("http://localhost/webhooks/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      }),
      undefined,
      env
    );
    expect(res.status).toBe(400);
  });
});

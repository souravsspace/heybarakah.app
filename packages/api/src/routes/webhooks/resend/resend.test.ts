import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDatabase } from "@/db";
import { emailQueue } from "@/db/schema";
import { createApp } from "@/lib/create-app";
import { applyMigrations } from "@/test-support/apply-migrations";
import { resendWebhook } from "./resend.index";
import { verifyResendSignature } from "./resend.service";

applyMigrations();

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

describe("verifyResendSignature", () => {
  const secret = `whsec_${btoa("supersecretkey")}`;

  it("accepts a correctly signed payload", async () => {
    const body = '{"type":"email.delivered"}';
    const now = String(Math.floor(Date.now() / 1000));
    const sig = await svixSign(secret, "msg_1", now, body);
    expect(
      await verifyResendSignature(
        secret,
        { id: "msg_1", timestamp: now, signature: sig },
        body
      )
    ).toBe(true);
  });

  it("rejects a stale timestamp outside the replay window", async () => {
    const body = '{"type":"email.delivered"}';
    const stale = "171";
    const sig = await svixSign(secret, "msg_1", stale, body);
    expect(
      await verifyResendSignature(
        secret,
        { id: "msg_1", timestamp: stale, signature: sig },
        body
      )
    ).toBe(false);
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

const WEBHOOK_SECRET = `whsec_${btoa("supersecretkey")}`;
const SIGNED_ENV = { ...env, RESEND_WEBHOOK_SECRET: WEBHOOK_SECRET };

// Build a request carrying valid svix headers signed with WEBHOOK_SECRET.
async function signedPost(rawBody: string): Promise<Request> {
  const id = "msg_test";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = await svixSign(WEBHOOK_SECRET, id, timestamp, rawBody);
  return new Request("http://localhost/webhooks/resend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    },
    body: rawBody,
  });
}

describe("resend webhook", () => {
  it("flips a queue row to failed on a bounce", async () => {
    const id = await seedSent("re_bounce_1");
    const body = JSON.stringify({
      type: "email.bounced",
      data: { email_id: "re_bounce_1" },
    });
    const res = await appWith().request(
      await signedPost(body),
      undefined,
      SIGNED_ENV
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
    const body = JSON.stringify({
      type: "email.delivered",
      data: { email_id: "re_ok_1" },
    });
    const res = await appWith().request(
      await signedPost(body),
      undefined,
      SIGNED_ENV
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
      await signedPost("{not json"),
      undefined,
      SIGNED_ENV
    );
    expect(res.status).toBe(400);
  });

  it("500s when the webhook secret is not configured", async () => {
    const res = await appWith().request(
      post({ type: "email.delivered", data: { email_id: "x" } }),
      undefined,
      { ...env, RESEND_WEBHOOK_SECRET: undefined }
    );
    expect(res.status).toBe(500);
  });

  it("403s on an invalid signature", async () => {
    const req = new Request("http://localhost/webhooks/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": "msg_test",
        "svix-timestamp": "171",
        "svix-signature": "v1,bm90LWEtdmFsaWQtc2ln",
      },
      body: JSON.stringify({
        type: "email.delivered",
        data: { email_id: "x" },
      }),
    });
    const res = await appWith().request(req, undefined, SIGNED_ENV);
    expect(res.status).toBe(403);
  });
});

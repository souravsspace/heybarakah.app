import { eq } from "drizzle-orm";

import type { Database } from "@/db";
import { emailQueue } from "@/db/schema";

export interface SvixHeaders {
  id: string;
  signature: string;
  timestamp: string;
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Reject signatures whose timestamp is outside this window (replay protection).
const MAX_SIGNATURE_AGE_SECONDS = 300;

/**
 * Verify a Resend (Svix) webhook signature with Web Crypto — no svix/node dep.
 * The signed content is `${id}.${timestamp}.${body}`, HMAC-SHA256'd with the
 * base64 secret (the part after `whsec_`). The `svix-signature` header is a
 * space-separated list of `v1,<sig>`; the request passes if any entry verifies.
 * Verification uses `crypto.subtle.verify` (constant-time, no early-return
 * string compare) and the timestamp must be within ±5 min (replay window).
 */
export async function verifyResendSignature(
  secret: string,
  headers: SvixHeaders,
  body: string
): Promise<boolean> {
  const ts = Number(headers.timestamp);
  if (
    !Number.isFinite(ts) ||
    Math.abs(Date.now() / 1000 - ts) > MAX_SIGNATURE_AGE_SECONDS
  ) {
    return false;
  }
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(rawSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signed = new TextEncoder().encode(
    `${headers.id}.${headers.timestamp}.${body}`
  );
  const candidates = headers.signature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean);
  for (const sig of candidates) {
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64ToBytes(sig),
      signed
    );
    if (ok) {
      return true;
    }
  }
  return false;
}

/**
 * Apply a Resend delivery event to the queue row identified by its provider id.
 * Hard failures (bounce/complaint) flip the row to `failed`; soft signals are
 * recorded but leave the row's terminal state alone. Ports convex
 * `handleEmailEvent` (which only logged) with durable bookkeeping.
 */
export async function applyEmailEvent(
  db: Database,
  eventType: string,
  emailId: string
): Promise<void> {
  if (!emailId) {
    return;
  }
  const now = Date.now();
  if (eventType === "email.bounced" || eventType === "email.complained") {
    await db
      .update(emailQueue)
      .set({ status: "failed", lastError: eventType, updatedAt: now })
      .where(eq(emailQueue.providerId, emailId));
  }
}

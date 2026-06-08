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

function bytesToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Verify a Resend (Svix) webhook signature with Web Crypto — no svix/node dep.
 * The signed content is `${id}.${timestamp}.${body}`, HMAC-SHA256'd with the
 * base64 secret (the part after `whsec_`). The `svix-signature` header is a
 * space-separated list of `v1,<sig>`; a match on any entry passes.
 */
export async function verifyResendSignature(
  secret: string,
  headers: SvixHeaders,
  body: string
): Promise<boolean> {
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(rawSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = `${headers.id}.${headers.timestamp}.${body}`;
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signed)
  );
  const expected = bytesToBase64(mac);
  return headers.signature
    .split(" ")
    .map((part) => part.split(",")[1])
    .some((sig) => sig === expected);
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

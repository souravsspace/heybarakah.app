import { createDatabase } from "@/db";
import { createRouter } from "@/lib/create-router";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
} from "@/stoker/http-status-codes";

import { applyEmailEvent, verifyResendSignature } from "./resend.service";

// Plain POST (not OpenAPI): the raw body is needed for Svix signature
// verification before any parsing.
export const resendWebhook = createRouter();

resendWebhook.post("/webhooks/resend", async (c) => {
  const body = await c.req.text();
  const secret = c.env.RESEND_WEBHOOK_SECRET;

  // Fail closed: without a secret we can't verify, so reject rather than process
  // forged events (a fake bounce could flip delivery rows to failed).
  if (!secret) {
    return c.text("webhook not configured", INTERNAL_SERVER_ERROR);
  }

  const id = c.req.header("svix-id");
  const timestamp = c.req.header("svix-timestamp");
  const signature = c.req.header("svix-signature");
  if (!(id && timestamp && signature)) {
    return c.text("missing signature headers", BAD_REQUEST);
  }
  const valid = await verifyResendSignature(
    secret,
    { id, timestamp, signature },
    body
  );
  if (!valid) {
    return c.text("invalid signature", 403);
  }

  let event: { type?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return c.text("bad json", BAD_REQUEST);
  }

  if (event.type && event.data?.email_id) {
    const db = createDatabase(c.env.DB);
    await applyEmailEvent(db, event.type, event.data.email_id);
  }
  return c.text("ok", OK);
});

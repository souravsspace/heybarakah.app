import { eq } from "drizzle-orm";

import type { Database } from "@/db";
import { liveActivityTokens } from "@/db/schema";

// APNs device tokens are hex; a push-to-start token is 64 chars today but Apple
// has lengthened token formats before, so cap generously rather than pin.
export const MAX_PUSH_TOKEN_LENGTH = 256;

export function listPushToStartTokens(db: Database, authUserId: string) {
  return db
    .select()
    .from(liveActivityTokens)
    .where(eq(liveActivityTokens.authUserId, authUserId));
}

export async function upsertPushToStartToken(
  db: Database,
  authUserId: string,
  token: string
): Promise<void> {
  const now = Date.now();
  // Conflict target is the token, not the user: one install owns one token, and
  // re-registering must move it to whoever is signed in now rather than leave a
  // stale row pushing to a device the previous account no longer holds.
  await db
    .insert(liveActivityTokens)
    .values({ authUserId, token, updatedAt: now })
    .onConflictDoUpdate({
      target: liveActivityTokens.token,
      set: { authUserId, updatedAt: now },
    });
}

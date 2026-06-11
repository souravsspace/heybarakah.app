import type { AppBindings } from "@/types/app-type";

/**
 * Fan an invalidation out to every device the user has connected to their
 * SyncHub Durable Object. Best-effort by contract: a realtime push must never
 * fail or delay the mutation the client already committed, so callers run this
 * inside `executionCtx.waitUntil` and swallow errors.
 */
export async function broadcastToUser(
  env: AppBindings["Bindings"],
  userId: string,
  topics: string[]
): Promise<void> {
  const stub = env.SYNC.getByName(userId);
  await stub.broadcast(topics);
}

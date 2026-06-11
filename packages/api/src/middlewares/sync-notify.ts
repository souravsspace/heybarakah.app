import { createMiddleware } from "hono/factory";

import { broadcastToUser } from "@/sync/notify";
import { topicForPath } from "@/sync/topics";
import type { AppBindings } from "@/types/app-type";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * After a successful mutation, push a realtime invalidation topic to the user's
 * other devices via their SyncHub Durable Object. Runs after the handler so it
 * only fires on a 2xx response, and only for mutating verbs on a domain that has
 * a reactive client query ({@link topicForPath}). Best-effort via `waitUntil` so
 * the fan-out never blocks or fails the write the client already received.
 */
export function syncNotify() {
  return createMiddleware<AppBindings>(async (c, next) => {
    await next();

    if (!(MUTATING_METHODS.has(c.req.method) && isSuccess(c.res.status))) {
      return;
    }
    const user = c.get("user");
    if (!user) {
      return;
    }
    const topic = topicForPath(c.req.path);
    if (!topic) {
      return;
    }

    c.executionCtx.waitUntil(
      broadcastToUser(c.env, user.id, [topic]).catch((error) => {
        c.get("logger").error("sync notify failed", {
          err: error instanceof Error ? error.message : String(error),
          topic,
        });
      })
    );
  });
}

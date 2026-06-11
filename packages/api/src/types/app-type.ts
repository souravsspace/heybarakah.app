import type {
  D1Database,
  DurableObjectNamespace,
  KVNamespace,
  R2Bucket,
} from "@cloudflare/workers-types";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

import type { createAuth } from "@/auth";
import type { EnvVars } from "@/env";
import type { Logger } from "@/middlewares/logger";
import type { SyncHub } from "@/sync/sync-hub";

type Auth = ReturnType<typeof createAuth>;
export type AuthUser = Auth["$Infer"]["Session"]["user"];

export interface AppBindings {
  Bindings: {
    DB: D1Database;
    KV: KVNamespace;
    R2: R2Bucket;
    // Per-user realtime hub (WebSocket hibernation). Addressed by Better Auth
    // user id via `SYNC.getByName(userId)`.
    SYNC: DurableObjectNamespace<SyncHub>;
  } & EnvVars;
  Variables: {
    logger: Logger;
    // Set per-request by the auth-session middleware. `user` is null for
    // unauthenticated requests (mirrors Convex `safeGetAuthUser`).
    auth: Auth;
    user: AuthUser | null;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouterHandler<T extends RouteConfig> = RouteHandler<
  T,
  AppBindings
>;

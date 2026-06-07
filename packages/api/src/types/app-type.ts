import type {
  D1Database,
  KVNamespace,
  R2Bucket,
} from "@cloudflare/workers-types";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

import type { EnvVars } from "@/env";
import type { Logger } from "@/middlewares/logger";

export interface AppBindings {
  Bindings: {
    DB: D1Database;
    KV: KVNamespace;
    R2: R2Bucket;
  } & EnvVars;
  Variables: {
    logger: Logger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouterHandler<T extends RouteConfig> = RouteHandler<
  T,
  AppBindings
>;

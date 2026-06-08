import type { IncomingRequestCfProperties } from "@cloudflare/workers-types";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { createAuth } from "@/auth";
import { UNAUTHORIZED } from "@/stoker/http-status-codes";
import type { AppBindings, AuthUser } from "@/types/app-type";

/**
 * Resolve the Better Auth session for each request and expose it on the
 * context. Builds a per-request auth instance (bound to D1/KV with the correct
 * baseURL + cf geolocation), then reads the session from the request headers —
 * accepting BOTH the Expo Bearer token and the web cookie. `user` is null when
 * unauthenticated, mirroring Convex `safeGetAuthUser` (never throws).
 */
export function authSession() {
  return createMiddleware<AppBindings>(async (c, next) => {
    const baseURL = c.env.BETTER_AUTH_URL ?? new URL(c.req.url).origin;
    const cf = (c.req.raw as { cf?: IncomingRequestCfProperties }).cf;
    const auth = createAuth(c.env, cf, baseURL);
    c.set("auth", auth);

    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      c.set("user", session?.user ?? null);
    } catch (error) {
      c.get("logger").error("auth session resolve failed", {
        err: error instanceof Error ? error.message : String(error),
      });
      c.set("user", null);
    }

    await next();
  });
}

/**
 * Return the authenticated user or throw 401. Use at the top of any handler
 * that requires auth (the JSON 401 is shaped by the stoker onError handler).
 */
export function requireUser(c: Context<AppBindings>): AuthUser {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(UNAUTHORIZED, {
      message: "Authentication required",
    });
  }
  return user;
}

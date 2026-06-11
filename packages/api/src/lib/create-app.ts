import { cors } from "hono/cors";
import { isTruthyFlag } from "@/env";
import { createRouter } from "@/lib/create-router";
import { authSession } from "@/middlewares/auth-session";
import { idempotency } from "@/middlewares/idempotency";
import { logger } from "@/middlewares/logger";
import { rateLimit } from "@/middlewares/rate-limit";
import { syncNotify } from "@/middlewares/sync-notify";
import notFound from "@/stoker/middlewares/not-found";
import onError from "@/stoker/middlewares/on-error";
import type { AppOpenAPI } from "@/types/app-type";

// Generous per-IP ceiling for general traffic — Better Auth applies its own
// stricter limit to /sign-in/*. Window clamps to the KV 60s minimum.
const GENERAL_RATE_LIMIT_MAX = 600;

// Stable web origins (app + marketing). Expo/native schemes are gated separately.
const WEB_ORIGINS = ["https://heybarakah.app", "https://www.heybarakah.app"];
const NATIVE_SCHEME_PREFIXES = ["barakah://", "exp://", "file://"];

function isAllowedOrigin(origin: string, allowExpo: boolean): boolean {
  if (WEB_ORIGINS.includes(origin)) {
    return true;
  }
  // `*.workers.dev` is the staging API domain and native schemes are dev clients;
  // both ride the same dev gate so prod (flag unset) never grants credentialed
  // CORS to an arbitrary Cloudflare Worker.
  if (allowExpo) {
    if (origin.endsWith(".workers.dev")) {
      return true;
    }
    return NATIVE_SCHEME_PREFIXES.some((prefix) => origin.startsWith(prefix));
  }
  return false;
}

function applyMiddleware(app: AppOpenAPI) {
  app.use(logger());
  app.use(
    "*",
    cors({
      origin: (origin, c) => {
        if (!origin) {
          return origin;
        }
        const allowExpo = isTruthyFlag(c.env.ALLOW_EXPO_ORIGINS);
        return isAllowedOrigin(origin, allowExpo) ? origin : "";
      },
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Idempotency-Key",
        "Cookie",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length", "x-request-id", "Set-Cookie"],
      maxAge: 600,
      credentials: true,
    })
  );
  // Rate-limit FIRST so flood traffic is rejected before the per-request auth
  // instance + D1 session read in authSession.
  app.use(rateLimit({ max: GENERAL_RATE_LIMIT_MAX, windowSeconds: 60 }));
  // Resolve the Better Auth session (sets c.var.auth + c.var.user) for every
  // request, then mount the Better Auth handler at /api/auth/*.
  app.use(authSession());
  // Idempotency replay (after authSession — keys are scoped by c.var.user.id).
  app.use(idempotency());
  // Realtime fan-out: after a successful mutation, push an invalidation topic to
  // the user's other devices via their SyncHub DO (no-op on reads / failures).
  app.use(syncNotify());
  app.on(["GET", "POST"], "/api/auth/*", (c) =>
    c.get("auth").handler(c.req.raw)
  );
  app.notFound(notFound);
  app.onError(onError);
}

export function createApp() {
  const app = createRouter();
  applyMiddleware(app);
  return app;
}

export function createTestApp(router: AppOpenAPI) {
  const app = createRouter();
  applyMiddleware(app);
  return app.route("/", router);
}

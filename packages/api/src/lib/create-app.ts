import { cors } from "hono/cors";
import { isTruthyFlag } from "@/env";
import { createRouter } from "@/lib/create-router";
import { authSession } from "@/middlewares/auth-session";
import { logger } from "@/middlewares/logger";
import notFound from "@/stoker/middlewares/not-found";
import onError from "@/stoker/middlewares/on-error";
import type { AppOpenAPI } from "@/types/app-type";

// Stable web origins (app + marketing). Expo/native schemes are gated separately.
const WEB_ORIGINS = ["https://heybarakah.app", "https://www.heybarakah.app"];
const NATIVE_SCHEME_PREFIXES = ["barakah://", "exp://", "file://"];

function isAllowedOrigin(origin: string, allowExpo: boolean): boolean {
  if (WEB_ORIGINS.includes(origin)) {
    return true;
  }
  if (origin.endsWith(".workers.dev")) {
    return true;
  }
  if (allowExpo) {
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
  // Resolve the Better Auth session (sets c.var.auth + c.var.user) for every
  // request, then mount the Better Auth handler at /api/auth/*.
  app.use(authSession());
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

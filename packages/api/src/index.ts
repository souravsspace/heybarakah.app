import type {
  Request as CfRequest,
  ExecutionContext,
  ScheduledController,
} from "@cloudflare/workers-types";

import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { achievements } from "@/routes/achievements/achievements.index";
import { appConfig } from "@/routes/app-config/app-config.index";
import { dhikr } from "@/routes/dhikr/dhikr.index";
import { healthCheck } from "@/routes/health-check/health-check.index";
import { marketing } from "@/routes/marketing/marketing.index";
import { prayerLogs } from "@/routes/prayer-logs/prayer-logs.index";
import { prayerTimes } from "@/routes/prayer-times/prayer-times.index";
import { shieldSelection } from "@/routes/shield-selection/shield-selection.index";
import { subscriptions } from "@/routes/subscriptions/subscriptions.index";
import { userLocations } from "@/routes/user-locations/user-locations.index";
import { usersRouter } from "@/routes/users/users.index";
import { polarWebhook } from "@/routes/webhooks/polar/polar.index";
import { resendWebhook } from "@/routes/webhooks/resend/resend.index";
import { handleScheduled } from "@/scheduled";
import type { AppBindings } from "@/types/app-type";

// Durable Object class must be a named export of the Worker entry so the runtime
// can instantiate it for the SYNC binding (wrangler.toml migration).
export { SyncHub } from "@/sync/sync-hub";

const app = createApp().basePath("/api/v1");

configureOpenAPI(app);

// Realtime WebSocket endpoint. Runs through the full middleware chain (so the
// Better Auth session is resolved into c.var.user), then upgrades the
// connection and forwards it to the caller's per-user SyncHub Durable Object,
// addressed by user id so every device shares one hub. The DO holds the socket
// via the Hibernation API; mutation routes broadcast invalidations into it.
app.get("/sync", async (c) => {
  if (c.req.header("Upgrade") !== "websocket") {
    return new Response("Expected a WebSocket upgrade", { status: 426 });
  }
  const user = c.get("user");
  if (!user) {
    return new Response("Authentication required", { status: 401 });
  }
  // Forward the upgrade to the user's hub DO. The workers/undici Request +
  // Response types differ from the lib.dom globals Hono uses, so bridge them.
  const stub = c.env.SYNC.getByName(user.id);
  const upgraded = await stub.fetch(c.req.raw as unknown as CfRequest);
  return upgraded as unknown as Response;
});

// Domain routers — each carries its own path; mounted under /api/v1. Chained
// explicitly (not a loop) so Hono RPC type inference is preserved for the typed
// client (`hc<AppType>`) the app consumes at cutover (§10).
const router = app
  .route("/", healthCheck)
  .route("/", appConfig)
  .route("/", achievements)
  .route("/", dhikr)
  .route("/", marketing)
  .route("/", prayerLogs)
  .route("/", prayerTimes)
  .route("/", shieldSelection)
  .route("/", subscriptions)
  .route("/", userLocations)
  .route("/", usersRouter)
  .route("/", polarWebhook)
  .route("/", resendWebhook);

// Type-only export for the app's Hono RPC client; erased at build (no runtime
// pull of worker code into the Expo bundle).
export type AppType = typeof router;

// Export both the fetch handler and the cron entrypoint (§9). The scheduled
// handler drives the durable email queue + prayer-cache eviction.
export default {
  fetch: app.fetch,
  scheduled: (
    _controller: ScheduledController,
    env: AppBindings["Bindings"],
    ctx: ExecutionContext
  ) => {
    ctx.waitUntil(handleScheduled(env));
  },
};

import type {
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

const app = createApp().basePath("/api/v1");

configureOpenAPI(app);

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

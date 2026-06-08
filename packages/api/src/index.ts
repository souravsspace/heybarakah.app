import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { appConfig } from "@/routes/app-config/app-config.index";
import { dhikr } from "@/routes/dhikr/dhikr.index";
import { healthCheck } from "@/routes/health-check/health-check.index";
import { prayerLogs } from "@/routes/prayer-logs/prayer-logs.index";
import { shieldSelection } from "@/routes/shield-selection/shield-selection.index";

const app = createApp().basePath("/api/v1");

configureOpenAPI(app);

// Domain routers — each carries its own path; mounted under /api/v1.
const routers = [
  healthCheck,
  appConfig,
  dhikr,
  prayerLogs,
  shieldSelection,
] as const;
for (const router of routers) {
  app.route("/", router);
}

export default app;

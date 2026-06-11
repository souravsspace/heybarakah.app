import { createRouter } from "@/lib/create-router";

import * as handlers from "./prayer-logs.handlers";
import * as routes from "./prayer-logs.routes";

export const prayerLogs = createRouter()
  .openapi(routes.getMyWeek, handlers.getMyWeek)
  .openapi(routes.logPrayer, handlers.logPrayer)
  .openapi(routes.getStreak, handlers.getStreak)
  .openapi(routes.clearPrayer, handlers.clearPrayer);

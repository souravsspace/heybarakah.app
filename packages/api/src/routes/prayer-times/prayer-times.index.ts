import { createRouter } from "@/lib/create-router";

import * as handlers from "./prayer-times.handlers";
import * as routes from "./prayer-times.routes";

export const prayerTimes = createRouter()
  .openapi(routes.getCachedPrayerTimes, handlers.getCachedPrayerTimes)
  .openapi(routes.refreshPrayerTimes, handlers.refreshPrayerTimes);

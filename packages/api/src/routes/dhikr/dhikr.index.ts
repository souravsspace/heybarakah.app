import { createRouter } from "@/lib/create-router";

import * as handlers from "./dhikr.handlers";
import * as routes from "./dhikr.routes";

export const dhikr = createRouter()
  .openapi(routes.getToday, handlers.getToday)
  .openapi(routes.increment, handlers.increment)
  .openapi(routes.setTarget, handlers.setTarget)
  .openapi(routes.reset, handlers.reset)
  .openapi(routes.getPresets, handlers.getPresets)
  .openapi(routes.incrementPreset, handlers.incrementPreset);

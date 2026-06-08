import { createRouter } from "@/lib/create-router";

import * as handlers from "./shield-selection.handlers";
import * as routes from "./shield-selection.routes";

export const shieldSelection = createRouter()
  .openapi(routes.getMine, handlers.getMine)
  .openapi(routes.upsertIos, handlers.upsertIos)
  .openapi(routes.upsertAndroid, handlers.upsertAndroid)
  .openapi(routes.setWindows, handlers.setWindows)
  .openapi(routes.setEnabled, handlers.setEnabled);

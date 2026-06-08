import { createRouter } from "@/lib/create-router";

import * as handlers from "./achievements.handlers";
import * as routes from "./achievements.routes";

export const achievements = createRouter()
  .openapi(routes.listForMe, handlers.listForMe)
  .openapi(routes.listUnseen, handlers.listUnseen)
  .openapi(routes.markSeen, handlers.markSeen);

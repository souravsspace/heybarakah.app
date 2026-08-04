import { createRouter } from "@/lib/create-router";

import * as handlers from "./live-activity.handlers";
import * as routes from "./live-activity.routes";

export const liveActivity = createRouter().openapi(
  routes.registerPushToStartToken,
  handlers.registerPushToStartToken
);

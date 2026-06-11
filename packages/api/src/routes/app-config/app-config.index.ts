import { createRouter } from "@/lib/create-router";

import * as handlers from "./app-config.handlers";
import * as routes from "./app-config.routes";

export const appConfig = createRouter().openapi(
  routes.getAppConfig,
  handlers.getAppConfig
);

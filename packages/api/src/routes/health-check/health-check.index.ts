import { createRouter } from "@/lib/create-router";

import * as handlers from "./health-check.handlers";
import * as routes from "./health-check.routes";

export const healthCheck = createRouter().openapi(routes.get, handlers.get);

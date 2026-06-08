import { createRouter } from "@/lib/create-router";

import * as handlers from "./marketing.handlers";
import * as routes from "./marketing.routes";

export const marketing = createRouter().openapi(
  routes.joinWaitlist,
  handlers.joinWaitlist
);

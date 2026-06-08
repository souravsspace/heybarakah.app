import { createRouter } from "@/lib/create-router";

import * as handlers from "./subscriptions.handlers";
import * as routes from "./subscriptions.routes";

export const subscriptions = createRouter()
  .openapi(routes.getMySubscription, handlers.getMySubscription)
  .openapi(routes.claimPolarByEmail, handlers.claimPolarByEmail)
  .openapi(routes.claimMockSubscription, handlers.claimMockSubscription)
  .openapi(routes.syncRevenueCat, handlers.syncRevenueCat);

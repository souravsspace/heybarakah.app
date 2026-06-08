import { createRouter } from "@/lib/create-router";

import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const usersRouter = createRouter()
  .openapi(routes.getMyAccount, handlers.getMyAccount)
  .openapi(routes.upsertProfile, handlers.upsertProfile)
  .openapi(routes.deleteMyAccount, handlers.deleteMyAccount);

import { createRouter } from "@/lib/create-router";

import * as handlers from "./user-locations.handlers";
import * as routes from "./user-locations.routes";

export const userLocations = createRouter()
  .openapi(routes.listMine, handlers.listMine)
  .openapi(routes.create, handlers.create)
  .openapi(routes.rename, handlers.rename)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.setActive, handlers.setActive);

import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./lib/auth";
import { webhook } from "./lib/polar";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });
http.route({
  path: "/api/webhooks/polar",
  method: "POST",
  handler: webhook,
});

export default http;

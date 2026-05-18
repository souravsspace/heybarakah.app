import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./lib/auth";
import { streamChat } from "./lib/chat";
import { webhook } from "./lib/polar";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });
http.route({
  path: "/api/webhooks/polar",
  method: "POST",
  handler: webhook,
});
http.route({
  path: "/api/chat/stream",
  method: "POST",
  handler: streamChat,
});
http.route({
  path: "/api/chat/stream",
  method: "OPTIONS",
  handler: streamChat,
});

export default http;

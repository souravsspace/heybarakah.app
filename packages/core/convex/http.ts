import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./lib/auth";
import { streamChat } from "./lib/chat";
import { webhook } from "./lib/polar";

const http = httpRouter();

const chatStreamOptions = httpAction(async () => {
  await Promise.resolve();
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
});

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
  handler: chatStreamOptions,
});

export default http;

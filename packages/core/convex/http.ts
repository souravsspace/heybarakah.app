import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./lib/auth";
import { webhook } from "./lib/polar";
import { resendHandler } from "./lib/resend";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });
http.route({
  path: "/api/webhooks/polar",
  method: "POST",
  handler: webhook,
});
http.route({
  path: "/api/webhooks/resend",
  method: "POST",
  handler: httpAction(
    async (ctx, req) => await resendHandler.handleResendEventWebhook(ctx, req)
  ),
});

export default http;

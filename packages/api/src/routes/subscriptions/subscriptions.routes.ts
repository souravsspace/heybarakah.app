import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

// Subscription rows carry many optional source-specific columns; responses are
// not runtime-validated, so an unknown body keeps handler return types assignable.
const SubscriptionSchema = z.unknown();
const ProductId = z.enum(["yearly", "monthly", "family", "lifetime"]);
const tags = ["Subscriptions"];

export const getMySubscription = createRoute({
  method: "get",
  path: "/subscription",
  tags,
  responses: {
    [OK]: jsonContent(SubscriptionSchema, "Active subscription, or null"),
  },
});

export const claimPolarByEmail = createRoute({
  method: "post",
  path: "/subscription/claim-polar",
  tags,
  responses: {
    [OK]: jsonContent(z.object({ linked: z.boolean() }), "Link result"),
  },
});

export const claimMockSubscription = createRoute({
  method: "post",
  path: "/subscription/claim-mock",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({ productId: ProductId }),
      "Mock product to grant (dev only)"
    ),
  },
  responses: {
    [OK]: jsonContent(SubscriptionSchema, "Mock subscription"),
  },
});

export const syncRevenueCat = createRoute({
  method: "post",
  path: "/subscription/revenuecat",
  tags,
  responses: {
    [OK]: jsonContent(
      SubscriptionSchema,
      "Verified RevenueCat subscription, or null"
    ),
  },
});

export type GetMySubscriptionRoute = typeof getMySubscription;
export type ClaimPolarRoute = typeof claimPolarByEmail;
export type ClaimMockRoute = typeof claimMockSubscription;
export type SyncRevenueCatRoute = typeof syncRevenueCat;

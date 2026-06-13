import { createRoute, z } from "@hono/zod-openapi";

import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  OK,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
} from "@/stoker/http-status-codes";
import {
  forbiddenResponse,
  rateLimitResponse,
  serverErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/stoker/openapi/helpers/error-responses";
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
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const claimPolarByEmail = createRoute({
  method: "post",
  path: "/subscription/claim-polar",
  tags,
  responses: {
    [OK]: jsonContent(z.object({ linked: z.boolean() }), "Link result"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
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
    [UNAUTHORIZED]: unauthorizedResponse,
    // Gated off (`ALLOW_MOCK_SUBSCRIPTIONS` unset) or product mismatch → service
    // throws FORBIDDEN.
    [FORBIDDEN]: forbiddenResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
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
    [UNAUTHORIZED]: unauthorizedResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetMySubscriptionRoute = typeof getMySubscription;
export type ClaimPolarRoute = typeof claimPolarByEmail;
export type ClaimMockRoute = typeof claimMockSubscription;
export type SyncRevenueCatRoute = typeof syncRevenueCat;

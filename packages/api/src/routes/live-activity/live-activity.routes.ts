import { createRoute, z } from "@hono/zod-openapi";

import {
  INTERNAL_SERVER_ERROR,
  OK,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
} from "@/stoker/http-status-codes";
import {
  rateLimitResponse,
  serverErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/stoker/openapi/helpers/error-responses";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

import { MAX_PUSH_TOKEN_LENGTH } from "./live-activity.service";

const tags = ["Live Activity"];

export const registerPushToStartToken = createRoute({
  method: "post",
  path: "/live-activity/push-to-start-token",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({ token: z.string().min(1).max(MAX_PUSH_TOKEN_LENGTH) }),
      "APNs push-to-start token for this install"
    ),
  },
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Token registered"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type RegisterPushToStartTokenRoute = typeof registerPushToStartToken;

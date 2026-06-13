import { createRoute, z } from "@hono/zod-openapi";

import {
  INTERNAL_SERVER_ERROR,
  OK,
  TOO_MANY_REQUESTS,
} from "@/stoker/http-status-codes";
import {
  rateLimitResponse,
  serverErrorResponse,
} from "@/stoker/openapi/helpers/error-responses";
import jsonContent from "@/stoker/openapi/helpers/json-content";

export const get = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    [OK]: jsonContent(
      z.object({ status: z.string() }).openapi({ example: { status: "OK" } }),
      "Service is healthy"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetRoute = typeof get;

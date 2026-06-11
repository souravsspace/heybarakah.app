import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
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
  },
});

export type GetRoute = typeof get;

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

const AppConfigSchema = z
  .object({
    minSupportedVersion: z.string(),
    iosStoreUrl: z.string(),
  })
  .nullable()
  .openapi({
    example: {
      minSupportedVersion: "1.0.0",
      iosStoreUrl: "https://apps.apple.com/app/id000",
    },
  });

export const getAppConfig = createRoute({
  method: "get",
  path: "/app-config",
  tags: ["AppConfig"],
  responses: {
    [OK]: jsonContent(
      AppConfigSchema,
      "Minimum supported version + store URL, or null"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetAppConfigRoute = typeof getAppConfig;

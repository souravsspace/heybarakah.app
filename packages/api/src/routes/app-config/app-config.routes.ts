import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
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
  },
});

export type GetAppConfigRoute = typeof getAppConfig;

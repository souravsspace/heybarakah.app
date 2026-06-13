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

// z.coerce parses the GET query strings and is a no-op for JSON-body numbers,
// so one schema serves both the read query and the refresh body. Domain-level
// validity (supported method, school, tz, date, 7-day window) is enforced in
// the service (`validatePrayerRequest` → 422).
// String/number bounds fail oversized input fast at the schema layer; the
// service still owns domain validity.
const PrayerRequestSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().min(1).max(64),
  countryCode: z.string().max(8).optional(),
  city: z.string().max(100).optional(),
  method: z.coerce.number().int(),
  school: z.coerce.number().int(),
  latitudeAdjustmentMethod: z.coerce.number().int().optional(),
  midnightMode: z.coerce.number().int().optional(),
  tune: z.string().max(50).optional(),
  startDate: z.string().max(10).openapi({ example: "2026-06-08" }),
  days: z.coerce.number().int().optional(),
});

const tags = ["PrayerTimes"];

export const getCachedPrayerTimes = createRoute({
  method: "get",
  path: "/prayer-times",
  tags,
  request: { query: PrayerRequestSchema },
  responses: {
    [OK]: jsonContent(
      z.unknown(),
      "Cached 7-day prayer window, or null on a miss"
    ),
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const refreshPrayerTimes = createRoute({
  method: "post",
  path: "/prayer-times/refresh",
  tags,
  request: {
    body: jsonContentRequired(PrayerRequestSchema, "Prayer time request"),
  },
  responses: {
    [OK]: jsonContent(z.unknown(), "Freshly computed + cached prayer window"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetCachedPrayerTimesRoute = typeof getCachedPrayerTimes;
export type RefreshPrayerTimesRoute = typeof refreshPrayerTimes;

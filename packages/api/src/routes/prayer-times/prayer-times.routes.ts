import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

// z.coerce parses the GET query strings and is a no-op for JSON-body numbers,
// so one schema serves both the read query and the refresh body. Domain-level
// validity (supported method, school, tz, date, 7-day window) is enforced in
// the service (`validatePrayerRequest` → 422).
const PrayerRequestSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  timezone: z.string().min(1),
  countryCode: z.string().optional(),
  city: z.string().optional(),
  method: z.coerce.number().int(),
  school: z.coerce.number().int(),
  latitudeAdjustmentMethod: z.coerce.number().int().optional(),
  midnightMode: z.coerce.number().int().optional(),
  tune: z.string().optional(),
  startDate: z.string().openapi({ example: "2026-06-08" }),
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
  },
});

export type GetCachedPrayerTimesRoute = typeof getCachedPrayerTimes;
export type RefreshPrayerTimesRoute = typeof refreshPrayerTimes;

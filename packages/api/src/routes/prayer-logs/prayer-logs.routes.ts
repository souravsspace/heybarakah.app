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

import { isValidDateKey, PRAYERS, STATUSES } from "./prayer-logs.service";

const DateKey = z
  .string()
  .refine(isValidDateKey, { message: "Invalid date" })
  .openapi({ example: "2026-06-08" });

const Prayer = z.enum(PRAYERS);
const Status = z.enum(STATUSES);

const PrayerLogSchema = z.object({
  id: z.string(),
  authUserId: z.string(),
  date: z.string(),
  prayer: Prayer,
  status: Status,
  prayedAt: z.number().nullable(),
  updatedAt: z.number(),
});

const StreakSchema = z.object({
  days: z.number(),
  best: z.number(),
  history: z.array(z.number()),
  todayDone: z.number(),
  asOf: z.string(),
});

const tags = ["PrayerLogs"];

export const getMyWeek = createRoute({
  method: "get",
  path: "/prayer-logs/week",
  tags,
  request: { query: z.object({ startDate: DateKey }) },
  responses: {
    [OK]: jsonContent(z.array(PrayerLogSchema), "This week's prayer logs"),
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const logPrayer = createRoute({
  method: "post",
  path: "/prayer-logs",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        date: DateKey,
        prayer: Prayer,
        status: Status,
        prayedAt: z.number().int().min(0).optional(),
      }),
      "Prayer log entry"
    ),
  },
  responses: {
    [OK]: jsonContent(
      z.object({ streak: StreakSchema, unlocked: z.array(z.string()) }),
      "Updated streak + newly unlocked achievements"
    ),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const getStreak = createRoute({
  method: "get",
  path: "/prayer-logs/streak",
  tags,
  request: { query: z.object({ today: DateKey }) },
  responses: {
    [OK]: jsonContent(StreakSchema, "Current streak"),
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const clearPrayer = createRoute({
  method: "post",
  path: "/prayer-logs/clear",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({ date: DateKey, prayer: Prayer }),
      "Prayer to clear"
    ),
  },
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Cleared"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetMyWeekRoute = typeof getMyWeek;
export type LogPrayerRoute = typeof logPrayer;
export type GetStreakRoute = typeof getStreak;
export type ClearPrayerRoute = typeof clearPrayer;

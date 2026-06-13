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

import { isValidDateKey, MAX_INCREMENT, MAX_TARGET } from "./dhikr.service";

const DateKey = z
  .string()
  .refine(isValidDateKey, { message: "Invalid date" })
  .openapi({ example: "2026-06-08" });

const TodaySchema = z.object({
  count: z.number(),
  target: z.number(),
  sessionTotal: z.number(),
});

const tags = ["Dhikr"];

export const getToday = createRoute({
  method: "get",
  path: "/dhikr/today",
  tags,
  request: {
    query: z.object({ date: DateKey }),
  },
  responses: {
    [OK]: jsonContent(
      TodaySchema,
      "Today's dhikr count, target, session total"
    ),
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const increment = createRoute({
  method: "post",
  path: "/dhikr/increment",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        date: DateKey,
        by: z.number().int().min(1).max(MAX_INCREMENT).optional(),
      }),
      "Increment amount (default 1)"
    ),
  },
  responses: {
    [OK]: jsonContent(z.object({ count: z.number() }), "Updated count"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const setTarget = createRoute({
  method: "post",
  path: "/dhikr/target",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        date: DateKey,
        target: z.number().int().min(1).max(MAX_TARGET),
      }),
      "New daily target"
    ),
  },
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Target updated"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const reset = createRoute({
  method: "post",
  path: "/dhikr/reset",
  tags,
  request: {
    body: jsonContentRequired(z.object({ date: DateKey }), "Day to reset"),
  },
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Day reset"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetTodayRoute = typeof getToday;
export type IncrementRoute = typeof increment;
export type SetTargetRoute = typeof setTarget;
export type ResetRoute = typeof reset;

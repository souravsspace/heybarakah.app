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

import {
  isValidDateKey,
  isValidPresetId,
  MAX_INCREMENT,
  MAX_TARGET,
} from "./dhikr.service";

const DateKey = z
  .string()
  .refine(isValidDateKey, { message: "Invalid date" })
  .openapi({ example: "2026-06-08" });

const PresetId = z
  .string()
  .refine(isValidPresetId, { message: "Invalid preset" })
  .openapi({ example: "subhanallah" });

const TodaySchema = z.object({
  count: z.number(),
  target: z.number(),
  sessionTotal: z.number(),
});

const PresetTotalsSchema = z.object({
  totals: z.record(z.string(), z.number()),
  monthly: z.record(z.string(), z.number()),
  grandTotal: z.number(),
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

export const getPresets = createRoute({
  method: "get",
  path: "/dhikr/presets",
  tags,
  responses: {
    [OK]: jsonContent(
      PresetTotalsSchema,
      "Per-preset lifetime totals + grand total"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const incrementPreset = createRoute({
  method: "post",
  path: "/dhikr/presets/increment",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        presetId: PresetId,
        by: z.number().int().min(1).max(MAX_INCREMENT).optional(),
      }),
      "Preset to increment + amount (default 1)"
    ),
  },
  responses: {
    [OK]: jsonContent(
      z.object({
        presetTotal: z.number(),
        grandTotal: z.number(),
        monthlyTotal: z.number(),
      }),
      "Updated preset total + grand total + monthly window total"
    ),
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
export type GetPresetsRoute = typeof getPresets;
export type IncrementPresetRoute = typeof incrementPreset;

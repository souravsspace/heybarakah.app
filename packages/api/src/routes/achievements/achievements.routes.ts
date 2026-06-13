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

const MAX_CODES = 64;

// Achievement metadata varies by entry (quote optional, icon, category, …) and
// responses are not runtime-validated, so an unknown item keeps the handler
// return types (the concrete core Achievement objects) assignable.
const AchievementItemSchema = z.unknown();

const tags = ["Achievements"];

export const listForMe = createRoute({
  method: "get",
  path: "/achievements",
  tags,
  responses: {
    [OK]: jsonContent(
      z.object({
        items: z.array(AchievementItemSchema),
        unlockedCount: z.number(),
        totalCount: z.number(),
      }),
      "All achievements with unlock state + progress"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const listUnseen = createRoute({
  method: "get",
  path: "/achievements/unseen",
  tags,
  responses: {
    [OK]: jsonContent(
      z.array(AchievementItemSchema),
      "Unlocked-but-unseen achievements"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const markSeen = createRoute({
  method: "post",
  path: "/achievements/seen",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({ codes: z.array(z.string().min(1).max(64)).max(MAX_CODES) }),
      "Achievement codes to mark seen"
    ),
  },
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Marked seen"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type ListForMeRoute = typeof listForMe;
export type ListUnseenRoute = typeof listUnseen;
export type MarkSeenRoute = typeof markSeen;

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
  unprocessableMessageResponse,
  validationErrorResponse,
} from "@/stoker/openapi/helpers/error-responses";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

// String bounds mirror @barakah/core validateProfileInput so oversized payloads
// die at the framework layer instead of reaching the handler.
const ProfileBody = z.object({
  name: z.string().max(120).optional(),
  gender: z.enum(["male", "female"]).optional(),
  madhab: z.enum(["hanafi", "shafii", "maliki", "hanbali", "none"]).optional(),
  consistency: z.enum(["never", "sometimes", "most", "all"]).optional(),
  struggle: z.enum(["phone", "forgetting", "fajr", "khushu"]).optional(),
  goal: z.enum(["all-five", "khushu", "phone-addiction", "fajr"]).optional(),
  calcMethod: z
    .enum(["isna", "mwl", "umm-al-qura", "egyptian", "karachi", "custom"])
    .optional(),
  strictness: z.enum(["adhan-iqama", "full-window", "custom"]).optional(),
  locationGranted: z.boolean().optional(),
  notifGranted: z.boolean().optional(),
  prayersToLock: z
    .object({
      fajr: z.boolean(),
      dhuhr: z.boolean(),
      asr: z.boolean(),
      maghrib: z.boolean(),
      isha: z.boolean(),
    })
    .optional(),
  completedAt: z.string().max(64).optional(),
  activePrayerLocationId: z.string().max(64).optional(),
});

const tags = ["Users"];

export const getMyAccount = createRoute({
  method: "get",
  path: "/me",
  tags,
  responses: {
    [OK]: jsonContent(z.unknown(), "Auth user + in-app profile, or null"),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const upsertProfile = createRoute({
  method: "post",
  path: "/me/profile",
  tags,
  request: {
    body: jsonContentRequired(ProfileBody, "Profile fields to upsert"),
  },
  responses: {
    [OK]: jsonContent(z.unknown(), "Updated profile row"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const deleteMyAccount = createRoute({
  method: "post",
  path: "/me/delete",
  tags,
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Account deleted"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const getMyAvatarUrl = createRoute({
  method: "get",
  path: "/me/avatar",
  tags,
  responses: {
    [OK]: jsonContent(
      z.object({ url: z.string().nullable() }),
      "Public avatar URL, or null when unset"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

// Worker-proxied upload (see §6): the raw image bytes are the request body, so
// the OpenAPI request schema is intentionally omitted; the handler validates
// content-type + size via lib/r2.
export const setAvatar = createRoute({
  method: "post",
  path: "/me/avatar",
  tags,
  responses: {
    [OK]: jsonContent(z.object({ key: z.string() }), "Stored avatar R2 key"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: unprocessableMessageResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type GetMyAccountRoute = typeof getMyAccount;
export type UpsertProfileRoute = typeof upsertProfile;
export type DeleteMyAccountRoute = typeof deleteMyAccount;
export type GetMyAvatarUrlRoute = typeof getMyAvatarUrl;
export type SetAvatarRoute = typeof setAvatar;

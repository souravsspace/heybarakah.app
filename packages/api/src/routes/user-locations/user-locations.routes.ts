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

const LocationSchema = z.object({
  id: z.string(),
  authUserId: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  city: z.string().nullable(),
  countryCode: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const IdParam = z.object({ id: z.string().min(1) });
const okResponse = jsonContent(z.object({ ok: z.boolean() }), "Updated");
const tags = ["Locations"];

export const listMine = createRoute({
  method: "get",
  path: "/locations",
  tags,
  responses: {
    [OK]: jsonContent(
      z.object({
        locations: z.array(LocationSchema),
        activeId: z.string().nullable(),
      }),
      "Saved locations + active id"
    ),
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const create = createRoute({
  method: "post",
  path: "/locations",
  tags,
  request: {
    body: jsonContentRequired(
      // Bounds mirror the service-level validation so oversized payloads are
      // rejected at the framework layer before reaching the handler.
      z.object({
        name: z.string().min(1).max(60),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        timezone: z.string().min(1).max(64),
        city: z.string().max(100).optional(),
        countryCode: z.string().max(8).optional(),
        setActive: z.boolean().optional(),
      }),
      "New location"
    ),
  },
  responses: {
    [OK]: jsonContent(z.object({ id: z.string() }), "Created location id"),
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const rename = createRoute({
  method: "post",
  path: "/locations/{id}/rename",
  tags,
  request: {
    params: IdParam,
    body: jsonContentRequired(
      z.object({ name: z.string().min(1).max(60) }),
      "New name"
    ),
  },
  responses: {
    [OK]: okResponse,
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const remove = createRoute({
  method: "post",
  path: "/locations/{id}/remove",
  tags,
  request: { params: IdParam },
  responses: {
    [OK]: okResponse,
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export const setActive = createRoute({
  method: "post",
  path: "/locations/{id}/active",
  tags,
  request: { params: IdParam },
  responses: {
    [OK]: okResponse,
    [UNAUTHORIZED]: unauthorizedResponse,
    [UNPROCESSABLE_ENTITY]: validationErrorResponse,
    [TOO_MANY_REQUESTS]: rateLimitResponse,
    [INTERNAL_SERVER_ERROR]: serverErrorResponse,
  },
});

export type ListMineRoute = typeof listMine;
export type CreateRoute = typeof create;
export type RenameRoute = typeof rename;
export type RemoveRoute = typeof remove;
export type SetActiveRoute = typeof setActive;

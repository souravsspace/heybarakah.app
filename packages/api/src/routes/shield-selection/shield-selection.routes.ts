import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

import {
  ALL_WINDOWS,
  MAX_ANDROID_PACKAGES,
  MAX_IOS_SELECTION_BYTES,
  MAX_PACKAGE_NAME_LENGTH,
} from "./shield-selection.service";

const Window = z.enum(ALL_WINDOWS);

const ShieldSchema = z
  .object({
    id: z.string(),
    authUserId: z.string(),
    iosSelectionData: z.string().nullable(),
    iosItemCount: z.number().nullable(),
    androidPackageNames: z.array(z.string()).nullable(),
    windows: z.array(Window),
    enabled: z.boolean(),
    updatedAt: z.number(),
  })
  .nullable();

const okResponse = jsonContent(z.object({ ok: z.boolean() }), "Updated");
const tags = ["Shield"];

export const getMine = createRoute({
  method: "get",
  path: "/shield",
  tags,
  responses: {
    [OK]: jsonContent(ShieldSchema, "The user's shield selection, or null"),
  },
});

export const upsertIos = createRoute({
  method: "post",
  path: "/shield/ios",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        iosSelectionData: z.string().max(MAX_IOS_SELECTION_BYTES),
        iosItemCount: z.number().int().min(0),
      }),
      "iOS FamilyActivitySelection blob + item count"
    ),
  },
  responses: { [OK]: okResponse },
});

export const upsertAndroid = createRoute({
  method: "post",
  path: "/shield/android",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        androidPackageNames: z
          .array(z.string().max(MAX_PACKAGE_NAME_LENGTH))
          .max(MAX_ANDROID_PACKAGES),
      }),
      "Android package names to block"
    ),
  },
  responses: { [OK]: okResponse },
});

export const setWindows = createRoute({
  method: "post",
  path: "/shield/windows",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({ windows: z.array(Window).max(ALL_WINDOWS.length) }),
      "Prayer windows to shield"
    ),
  },
  responses: { [OK]: okResponse },
});

export const setEnabled = createRoute({
  method: "post",
  path: "/shield/enabled",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({ enabled: z.boolean() }),
      "Enable/disable shield"
    ),
  },
  responses: { [OK]: okResponse },
});

export type GetMineRoute = typeof getMine;
export type UpsertIosRoute = typeof upsertIos;
export type UpsertAndroidRoute = typeof upsertAndroid;
export type SetWindowsRoute = typeof setWindows;
export type SetEnabledRoute = typeof setEnabled;

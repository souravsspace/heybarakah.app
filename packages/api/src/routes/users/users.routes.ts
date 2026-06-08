import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

const ProfileBody = z.object({
  name: z.string().optional(),
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
  completedAt: z.string().optional(),
  activePrayerLocationId: z.string().optional(),
});

const tags = ["Users"];

export const getMyAccount = createRoute({
  method: "get",
  path: "/me",
  tags,
  responses: {
    [OK]: jsonContent(z.unknown(), "Auth user + in-app profile, or null"),
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
  },
});

export const deleteMyAccount = createRoute({
  method: "post",
  path: "/me/delete",
  tags,
  responses: {
    [OK]: jsonContent(z.object({ ok: z.boolean() }), "Account deleted"),
  },
});

export type GetMyAccountRoute = typeof getMyAccount;
export type UpsertProfileRoute = typeof upsertProfile;
export type DeleteMyAccountRoute = typeof deleteMyAccount;

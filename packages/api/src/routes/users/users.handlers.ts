import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  DeleteMyAccountRoute,
  GetMyAccountRoute,
  GetMyAvatarUrlRoute,
  SetAvatarRoute,
  UpsertProfileRoute,
} from "./users.routes";
import * as service from "./users.service";

export const getMyAccount: AppRouterHandler<GetMyAccountRoute> = async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(null, OK);
  }
  const db = createDatabase(c.env.DB);
  const profile = await service.getProfile(db, user.id);
  return c.json({ user, profile }, OK);
};

export const upsertProfile: AppRouterHandler<UpsertProfileRoute> = async (
  c
) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  const row = await service.upsertProfile(db, user.id, c.req.valid("json"));
  return c.json(row, OK);
};

export const deleteMyAccount: AppRouterHandler<DeleteMyAccountRoute> = async (
  c
) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  await service.deleteMyAccount(db, c.env.R2, user.id, user.email);
  return c.json({ ok: true }, OK);
};

export const getMyAvatarUrl: AppRouterHandler<GetMyAvatarUrlRoute> = async (
  c
) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ url: null }, OK);
  }
  const db = createDatabase(c.env.DB);
  const profile = await service.getProfile(db, user.id);
  const url = profile?.image
    ? `${c.env.BETTER_AUTH_URL}/api/v1/avatars/${user.id}`
    : null;
  return c.json({ url }, OK);
};

export const setAvatar: AppRouterHandler<SetAvatarRoute> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  const body = await c.req.raw.arrayBuffer();
  const key = await service.setAvatar(
    db,
    c.env.R2,
    user.id,
    body,
    c.req.header("content-type") ?? null
  );
  return c.json({ key }, OK);
};

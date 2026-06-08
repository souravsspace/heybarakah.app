import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  DeleteMyAccountRoute,
  GetMyAccountRoute,
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

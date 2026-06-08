import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  GetMineRoute,
  SetEnabledRoute,
  SetWindowsRoute,
  UpsertAndroidRoute,
  UpsertIosRoute,
} from "./shield-selection.routes";
import * as service from "./shield-selection.service";

export const getMine: AppRouterHandler<GetMineRoute> = async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(null, OK);
  }
  const db = createDatabase(c.env.DB);
  const row = await service.getMine(db, user.id);
  return c.json(row ?? null, OK);
};

export const upsertIos: AppRouterHandler<UpsertIosRoute> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  await service.upsertIos(db, user.id, c.req.valid("json"));
  return c.json({ ok: true }, OK);
};

export const upsertAndroid: AppRouterHandler<UpsertAndroidRoute> = async (
  c
) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  await service.upsertAndroid(
    db,
    user.id,
    c.req.valid("json").androidPackageNames
  );
  return c.json({ ok: true }, OK);
};

export const setWindows: AppRouterHandler<SetWindowsRoute> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  await service.setWindows(db, user.id, c.req.valid("json").windows);
  return c.json({ ok: true }, OK);
};

export const setEnabled: AppRouterHandler<SetEnabledRoute> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  await service.setEnabled(db, user.id, c.req.valid("json").enabled);
  return c.json({ ok: true }, OK);
};

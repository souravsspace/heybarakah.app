import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  CreateRoute,
  ListMineRoute,
  RemoveRoute,
  RenameRoute,
  SetActiveRoute,
} from "./user-locations.routes";
import * as service from "./user-locations.service";

export const listMine: AppRouterHandler<ListMineRoute> = async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ locations: [], activeId: null }, OK);
  }
  const db = createDatabase(c.env.DB);
  return c.json(await service.listMine(db, user.id), OK);
};

export const create: AppRouterHandler<CreateRoute> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  const id = await service.create(db, user.id, c.req.valid("json"));
  return c.json({ id }, OK);
};

export const rename: AppRouterHandler<RenameRoute> = async (c) => {
  const user = requireUser(c);
  const { id } = c.req.valid("param");
  const { name } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  await service.rename(db, user.id, id, name);
  return c.json({ ok: true }, OK);
};

export const remove: AppRouterHandler<RemoveRoute> = async (c) => {
  const user = requireUser(c);
  const { id } = c.req.valid("param");
  const db = createDatabase(c.env.DB);
  await service.remove(db, user.id, id);
  return c.json({ ok: true }, OK);
};

export const setActive: AppRouterHandler<SetActiveRoute> = async (c) => {
  const user = requireUser(c);
  const { id } = c.req.valid("param");
  const db = createDatabase(c.env.DB);
  await service.setActive(db, user.id, id);
  return c.json({ ok: true }, OK);
};

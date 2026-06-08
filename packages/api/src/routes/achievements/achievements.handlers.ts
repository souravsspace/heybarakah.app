import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  ListForMeRoute,
  ListUnseenRoute,
  MarkSeenRoute,
} from "./achievements.routes";
import * as service from "./achievements.service";

export const listForMe: AppRouterHandler<ListForMeRoute> = async (c) => {
  const db = createDatabase(c.env.DB);
  const user = c.get("user");
  return c.json(await service.listForMe(db, user?.id ?? null), OK);
};

export const listUnseen: AppRouterHandler<ListUnseenRoute> = async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json([], OK);
  }
  const db = createDatabase(c.env.DB);
  return c.json(await service.listUnseen(db, user.id), OK);
};

export const markSeen: AppRouterHandler<MarkSeenRoute> = async (c) => {
  const user = requireUser(c);
  const { codes } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  await service.markSeen(db, user.id, codes);
  return c.json({ ok: true }, OK);
};

import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type { RegisterPushToStartTokenRoute } from "./live-activity.routes";
import * as service from "./live-activity.service";

export const registerPushToStartToken: AppRouterHandler<
  RegisterPushToStartTokenRoute
> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  await service.upsertPushToStartToken(db, user.id, c.req.valid("json").token);
  return c.json({ ok: true }, OK);
};

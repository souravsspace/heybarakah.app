import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";

import type {
  GetCachedPrayerTimesRoute,
  RefreshPrayerTimesRoute,
} from "./prayer-times.routes";
import * as service from "./prayer-times.service";

export const getCachedPrayerTimes: AppRouterHandler<
  GetCachedPrayerTimesRoute
> = async (c) => {
  const db = createDatabase(c.env.DB);
  const cached = await service.getCachedPrayerTimes(
    db,
    c.env.KV,
    c.req.valid("query")
  );
  return c.json(cached, OK);
};

export const refreshPrayerTimes: AppRouterHandler<
  RefreshPrayerTimesRoute
> = async (c) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  const fresh = await service.refreshPrayerTimes(
    db,
    c.env.KV,
    c.req.valid("json"),
    user.id
  );
  return c.json(fresh, OK);
};

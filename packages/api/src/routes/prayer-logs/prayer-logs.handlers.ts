import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  ClearPrayerRoute,
  GetMyWeekRoute,
  GetStreakRoute,
  LogPrayerRoute,
} from "./prayer-logs.routes";
import * as service from "./prayer-logs.service";

const STREAK_HISTORY_DAYS = 28;

export const getMyWeek: AppRouterHandler<GetMyWeekRoute> = async (c) => {
  const { startDate } = c.req.valid("query");
  const user = c.get("user");
  if (!user) {
    return c.json([], OK);
  }
  const db = createDatabase(c.env.DB);
  return c.json(await service.getMyWeek(db, user.id, startDate), OK);
};

export const logPrayer: AppRouterHandler<LogPrayerRoute> = async (c) => {
  const user = requireUser(c);
  const body = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  return c.json(await service.logPrayer(db, user.id, body), OK);
};

export const getStreak: AppRouterHandler<GetStreakRoute> = async (c) => {
  const { today } = c.req.valid("query");
  const user = c.get("user");
  if (!user) {
    return c.json(
      {
        days: 0,
        best: 0,
        history: Array.from({ length: STREAK_HISTORY_DAYS }, () => 0),
        todayDone: 0,
        asOf: today,
      },
      OK
    );
  }
  const db = createDatabase(c.env.DB);
  return c.json(await service.getStreak(db, user.id, today), OK);
};

export const clearPrayer: AppRouterHandler<ClearPrayerRoute> = async (c) => {
  const user = requireUser(c);
  const { date, prayer } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  await service.clearPrayer(db, user.id, date, prayer);
  return c.json({ ok: true }, OK);
};

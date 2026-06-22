import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  GetPresetsRoute,
  GetTodayRoute,
  IncrementPresetRoute,
  IncrementRoute,
  ResetRoute,
  SetTargetRoute,
} from "./dhikr.routes";
import * as service from "./dhikr.service";

export const getToday: AppRouterHandler<GetTodayRoute> = async (c) => {
  const { date } = c.req.valid("query");
  const user = c.get("user");
  // Lenient like Convex: unauthenticated reads return defaults, not 401.
  if (!user) {
    return c.json(
      { count: 0, target: service.DEFAULT_TARGET, sessionTotal: 0 },
      OK
    );
  }
  const db = createDatabase(c.env.DB);
  return c.json(await service.getToday(db, user.id, date), OK);
};

export const increment: AppRouterHandler<IncrementRoute> = async (c) => {
  const user = requireUser(c);
  const { date, by } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  const count = await service.increment(db, user.id, date, by ?? 1);
  return c.json({ count }, OK);
};

export const setTarget: AppRouterHandler<SetTargetRoute> = async (c) => {
  const user = requireUser(c);
  const { date, target } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  await service.setTarget(db, user.id, date, target);
  return c.json({ ok: true }, OK);
};

export const reset: AppRouterHandler<ResetRoute> = async (c) => {
  const user = requireUser(c);
  const { date } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  await service.reset(db, user.id, date);
  return c.json({ ok: true }, OK);
};

export const getPresets: AppRouterHandler<GetPresetsRoute> = async (c) => {
  const user = c.get("user");
  // Lenient like getToday: unauthenticated reads return empty totals, not 401.
  if (!user) {
    return c.json({ totals: {}, monthly: {}, grandTotal: 0 }, OK);
  }
  const db = createDatabase(c.env.DB);
  return c.json(await service.getPresetTotals(db, user.id), OK);
};

export const incrementPreset: AppRouterHandler<IncrementPresetRoute> = async (
  c
) => {
  const user = requireUser(c);
  const { presetId, by } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  const result = await service.incrementPreset(db, user.id, presetId, by ?? 1);
  return c.json(result, OK);
};

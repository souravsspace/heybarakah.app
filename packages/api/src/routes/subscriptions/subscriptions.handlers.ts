import { createDatabase } from "@/db";
import { requireUser } from "@/middlewares/auth-session";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type {
  ClaimMockRoute,
  ClaimPolarRoute,
  GetMySubscriptionRoute,
  SyncRevenueCatRoute,
} from "./subscriptions.routes";
import * as service from "./subscriptions.service";

export const getMySubscription: AppRouterHandler<
  GetMySubscriptionRoute
> = async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(null, OK);
  }
  const db = createDatabase(c.env.DB);
  const row = await service.getMySubscription(
    db,
    {
      id: user.id,
      email: user.email,
    },
    c.env
  );
  return c.json(row, OK);
};

export const claimPolarByEmail: AppRouterHandler<ClaimPolarRoute> = async (
  c
) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  const result = await service.claimPolarByEmail(db, {
    id: user.id,
    email: user.email,
  });
  return c.json(result, OK);
};

export const claimMockSubscription: AppRouterHandler<ClaimMockRoute> = async (
  c
) => {
  const user = requireUser(c);
  const { productId } = c.req.valid("json");
  const db = createDatabase(c.env.DB);
  const row = await service.claimMockSubscription(
    db,
    c.env,
    { id: user.id, email: user.email },
    productId
  );
  return c.json(row, OK);
};

export const syncRevenueCat: AppRouterHandler<SyncRevenueCatRoute> = async (
  c
) => {
  const user = requireUser(c);
  const db = createDatabase(c.env.DB);
  const row = await service.syncRevenueCatEntitlement(db, c.env, {
    id: user.id,
    email: user.email,
  });
  return c.json(row, OK);
};

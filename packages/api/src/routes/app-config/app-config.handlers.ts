import { createDatabase } from "@/db";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type { GetAppConfigRoute } from "./app-config.routes";
import { getAppConfig as readAppConfig } from "./app-config.service";

export const getAppConfig: AppRouterHandler<GetAppConfigRoute> = async (c) => {
  const db = createDatabase(c.env.DB);
  const config = await readAppConfig(db);
  return c.json(config, OK);
};

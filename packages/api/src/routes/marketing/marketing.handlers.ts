import { parseEnv } from "@/env";
import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";
import type { JoinWaitlistRoute } from "./marketing.routes";
import { joinWaitlist as joinWaitlistService } from "./marketing.service";

export const joinWaitlist: AppRouterHandler<JoinWaitlistRoute> = async (c) => {
  const { email } = c.req.valid("json");
  const env = parseEnv(c.env);
  return c.json(await joinWaitlistService(env, email), OK);
};

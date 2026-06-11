import { OK } from "@/stoker/http-status-codes";
import type { AppRouterHandler } from "@/types/app-type";

import type { GetRoute } from "./health-check.routes";

// Ports convex/lib/healthCheck.ts `get` (returned "OK"). JSON object keeps the
// OpenAPI contract typed.
export const get: AppRouterHandler<GetRoute> = (c) =>
  c.json({ status: "OK" }, OK);

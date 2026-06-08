import { createRoute, z } from "@hono/zod-openapi";

import { OK } from "@/stoker/http-status-codes";
import jsonContent from "@/stoker/openapi/helpers/json-content";
import jsonContentRequired from "@/stoker/openapi/helpers/json-content-required";

export const joinWaitlist = createRoute({
  method: "post",
  path: "/marketing/waitlist",
  tags: ["Marketing"],
  request: {
    body: jsonContentRequired(
      z.object({ email: z.string() }),
      "Email to add to the waitlist"
    ),
  },
  responses: {
    [OK]: jsonContent(
      z.object({
        ok: z.boolean(),
        error: z.string().optional(),
        warning: z.string().optional(),
      }),
      "Waitlist join result"
    ),
  },
});

export type JoinWaitlistRoute = typeof joinWaitlist;

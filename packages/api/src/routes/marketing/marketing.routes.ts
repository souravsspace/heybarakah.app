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
      // Length cap only — format validation stays in the service, which soft-
      // fails with 200 + ok:false so the marketing form can show the message
      // (and the rate limiter still counts the attempt).
      z.object({ email: z.string().max(254) }),
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

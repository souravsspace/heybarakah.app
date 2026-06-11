import { createRouter } from "@/lib/create-router";
import { rateLimit } from "@/middlewares/rate-limit";

import * as handlers from "./marketing.handlers";
import * as routes from "./marketing.routes";

const router = createRouter();

// The waitlist is unauthenticated and fans out to two Resend calls per accepted
// request, so it gets a dedicated budget far tighter than the global 600/min/IP
// limiter — a cost/abuse + Resend-reputation guard.
router.use(
  "/marketing/waitlist",
  rateLimit({ scope: "marketing-waitlist", max: 5, windowSeconds: 60 })
);

export const marketing = router.openapi(
  routes.joinWaitlist,
  handlers.joinWaitlist
);

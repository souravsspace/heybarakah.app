import { ConvexHttpClient } from "convex/browser";

import { api } from "@barakah/core/convex/_generated/api";

import { env } from "@/env";

// Module-scope on purpose: PUBLIC_CONVEX_URL is baked at build time and the
// HTTP client is stateless, so one instance per worker isolate is correct.
const convex = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

export async function joinWaitlist(email: string) {
  return await convex.action(api.lib.marketing.joinWaitlist, { email });
}

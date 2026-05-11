import { ConvexHttpClient } from "convex/browser";

import { api } from "@barakah/core/convex/_generated/api";

import { env } from "@/env";

const convex = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

export async function joinWaitlist(email: string) {
  return await convex.action(api.lib.marketing.joinWaitlist, { email });
}

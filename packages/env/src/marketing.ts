import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  client: {
    PUBLIC_CONVEX_URL: z.url(),
  },
  runtimeEnv: {
    PUBLIC_CONVEX_URL:
      import.meta.env.PUBLIC_CONVEX_URL ?? process.env.PUBLIC_CONVEX_URL,
  },
  emptyStringAsUndefined: true,
});

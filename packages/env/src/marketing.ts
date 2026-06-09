import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  // Empty but present so t3-env's client/server cross-contamination check is
  // active — a server-only secret added here would now fail validation.
  server: {},
  client: {
    PUBLIC_API_URL: z.url(),
  },
  runtimeEnv: {
    PUBLIC_API_URL:
      import.meta.env.PUBLIC_API_URL ?? process.env.PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});

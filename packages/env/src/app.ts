import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "EXPO_PUBLIC_",
  // Empty but present so t3-env's client/server cross-contamination check is
  // active — a server-only secret added here would now fail validation.
  server: {},
  client: {
    EXPO_PUBLIC_CONVEX_URL: z.url(),
    EXPO_PUBLIC_CONVEX_SITE_URL: z.url(),
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: z.string().optional(),
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: z.string().optional(),
    // Cloudflare API base (Hono) + cutover flag (§10). When the flag is off the
    // app stays on Convex; both URLs coexist until the flip is proven.
    EXPO_PUBLIC_API_URL: z.url().optional(),
    EXPO_PUBLIC_USE_CF_API: z
      .string()
      .optional()
      .transform((value) => value === "true" || value === "1"),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
    EXPO_PUBLIC_CONVEX_SITE_URL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_USE_CF_API: process.env.EXPO_PUBLIC_USE_CF_API,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});

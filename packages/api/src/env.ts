import { z } from "zod";

// Workers runtime: env comes from `c.env` bindings, never a global singleton or
// `process.env`. `parseEnv` is called lazily at the call sites that need secrets
// (auth setup, webhooks), not at app construction.
export const EnvSchema = z.object({
  // Core
  // HMAC-SHA256 session signing key — must be high-entropy (≥32 chars).
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  SITE_URL: z.string().url(),
  NATIVE_APP_URL: z.string().min(1),

  // Social providers (optional per-env)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_AUDIENCE_ID: z.string().optional(),
  RESEND_FROM: z.string().optional(),
  RESEND_REPLY_TO: z.string().optional(),
  RESEND_AUTH_EMAIL: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),

  // Billing
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  REVENUECAT_SECRET_KEY: z.string().optional(),

  // Dev-only gates — MUST stay unset in production
  ALLOW_MOCK_SUBSCRIPTIONS: z.string().optional(),
  ALLOW_EXPO_ORIGINS: z.string().optional(),

  // Debug/observability flags (isTruthyFlag: "true" or "1"). DEBUG exposes
  // error stacks + docs UI; LOG_LEVEL enables debug logs; DOCS_ENABLED exposes
  // the OpenAPI doc + Scalar UI without the rest of DEBUG.
  DEBUG: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  DOCS_ENABLED: z.string().optional(),
});

export type EnvVars = z.infer<typeof EnvSchema>;

/**
 * Validate the subset of string env vars carried on `c.env`. Throws with a
 * readable list of missing/invalid keys. Resource bindings (DB/KV/R2) are not
 * validated here — they are typed on `AppBindings`.
 */
export function parseEnv(env: unknown): EnvVars {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const fields = Object.keys(result.error.flatten().fieldErrors);
    throw new Error(`Invalid environment variables: ${fields.join(", ")}`);
  }
  return result.data;
}

export function isTruthyFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

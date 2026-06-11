import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { expo } from "@better-auth/expo";
import type {
  D1Database,
  IncomingRequestCfProperties,
} from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzle } from "drizzle-orm/d1";

import { sendOTPEmail } from "@/auth/send-otp";
import { schema } from "@/db/schema";
import { type EnvVars, isTruthyFlag } from "@/env";
import type { AppBindings } from "@/types/app-type";

type AuthEnv = AppBindings["Bindings"];

// Better Auth tables use singular names (usePlural: false) so they never collide
// with the existing app `users` profile table. `authUserId` on every app table
// equals Better Auth `user.id`.
const USE_PLURAL = false;

function buildTrustedOrigins(env: EnvVars): string[] {
  const origins = [
    env.SITE_URL,
    env.NATIVE_APP_URL,
    "https://appleid.apple.com",
  ];
  // Expo Go dev URLs — opt-in only (set ALLOW_EXPO_ORIGINS=true on dev). Prod
  // never trusts exp://. Mirrors convex/lib/auth.ts.
  if (isTruthyFlag(env.ALLOW_EXPO_ORIGINS)) {
    origins.push("exp://**", "exp://*");
  }
  return origins;
}

function buildSocialProviders(env: EnvVars) {
  return {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: env.APPLE_CLIENT_ID,
            clientSecret: env.APPLE_CLIENT_SECRET,
            appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
          },
        }
      : {}),
  };
}

/**
 * Dual-mode Better Auth factory. With no `env` it builds the CLI schema-gen
 * config (`@better-auth/cli generate`); with `env` it builds the per-request
 * runtime instance bound to D1 + KV. Ports `convex/lib/auth.ts` to the
 * Cloudflare stack: emailOTP + Apple + Google + Expo, deleteUser enabled.
 * No anonymous / email-password — the app never used them.
 */
export function createAuth(
  env?: AuthEnv,
  cf?: IncomingRequestCfProperties,
  baseURL?: string
) {
  const db = env ? drizzle(env.DB, { schema }) : undefined;

  return betterAuth({
    baseURL,
    ...(env ? { secret: env.BETTER_AUTH_SECRET } : {}),
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf ?? ({} as IncomingRequestCfProperties),
        d1: env && db ? { db, options: { usePlural: USE_PLURAL } } : undefined,
        kv: env?.KV,
      },
      {
        emailAndPassword: { enabled: false },
        socialProviders: env ? buildSocialProviders(env) : {},
        trustedOrigins: env ? buildTrustedOrigins(env) : [],
        user: { deleteUser: { enabled: true } },
        rateLimit: {
          enabled: true,
          window: 60,
          max: 100,
          customRules: {
            "/sign-in/email": { window: 60, max: 100 },
            "/sign-in/social": { window: 60, max: 100 },
            // OTP send triggers an outbound email per request — a tighter budget
            // than the global limit prevents email-bombing a victim address.
            "/email-otp/send-verification-otp": { window: 60, max: 5 },
          },
        },
        plugins: [
          emailOTP({
            // 6-digit code, 5-minute expiry, 3 verification attempts — pinned
            // explicitly so a dep bump can't silently regress these.
            otpLength: 6,
            expiresIn: 300,
            allowedAttempts: 3,
            sendVerificationOTP({ email, otp, type }) {
              if (type !== "sign-in" && type !== "email-verification") {
                return Promise.resolve();
              }
              if (!env) {
                return Promise.resolve();
              }
              return sendOTPEmail(env, { to: email, code: otp });
            },
          }),
          expo(),
        ],
      }
    ),
    // CLI schema generation needs a bare drizzle adapter (no runtime env).
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
            usePlural: USE_PLURAL,
          }),
        }),
  });
}

// Consumed by `@better-auth/cli generate` to emit the auth tables.
export const auth = createAuth();

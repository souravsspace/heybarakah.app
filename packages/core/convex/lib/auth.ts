import { expo } from "@better-auth/expo";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { query } from "../_generated/server";
import authConfig from "../auth.config";
import { requireEnv } from "./env";
import { sendOTPVerification } from "./resend";

const siteUrl = requireEnv("SITE_URL");
const nativeAppUrl = requireEnv("NATIVE_APP_URL");
const convexSiteUrl = requireEnv("CONVEX_SITE_URL");
// TODO: disabled for now add it letter
// const appleBundleId = process.env.APPLE_APP_BUNDLE_IDENTIFIER || "";
const googleClientId = requireEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = requireEnv("GOOGLE_CLIENT_SECRET");

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: convexSiteUrl,
    trustedOrigins: [
      siteUrl,
      nativeAppUrl,
      // Expo Go dev URLs. Harmless in production — no real client uses exp://.
      "exp://**",
      "exp://*",
    ],
    user: {
      deleteUser: { enabled: true },
    },
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
      // Apple — config retained but disabled until prerequisites are set.
      // Uncomment + set APPLE_APP_BUNDLE_IDENTIFIER to enable.
      // apple: {
      //   clientId: "",
      //   clientSecret: "",
      //   appBundleIdentifier: appleBundleId,
      // },
    },
    plugins: [
      expo(),
      crossDomain({ siteUrl }),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          console.warn("[auth] sendVerificationOTP called", { email, type });
          if (type !== "sign-in" && type !== "email-verification") {
            console.warn("[auth] OTP type skipped", { type });
            return;
          }
          try {
            await sendOTPVerification(requireActionCtx(ctx), {
              to: email,
              code: otp,
            });
            console.warn("[auth] OTP enqueue returned", { email, type });
          } catch (err) {
            console.error("[auth] OTP send failed", {
              email,
              type,
              error: err instanceof Error ? err.message : String(err),
            });
            throw err;
          }
        },
      }),
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => await authComponent.safeGetAuthUser(ctx),
});

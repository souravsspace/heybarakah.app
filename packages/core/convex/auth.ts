import { expo } from "@better-auth/expo";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { sendOTPVerification } from "./_lib/resend/emails";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL || "http://localhost:8081";
const nativeAppUrl = process.env.NATIVE_APP_URL || "barakah://";
// TODO: disabled for now add it letter
// const appleBundleId = process.env.APPLE_APP_BUNDLE_IDENTIFIER || "";
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
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
          if (type === "sign-in" || type === "email-verification") {
            await sendOTPVerification(requireActionCtx(ctx), {
              to: email,
              code: otp,
            });
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

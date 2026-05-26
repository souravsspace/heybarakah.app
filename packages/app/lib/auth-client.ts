import { env } from "@barakah/env/app";
import { expoClient } from "@better-auth/expo/client";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

function resolveExpoScheme(): string {
  const raw = Constants.expoConfig?.scheme;
  const scheme = Array.isArray(raw) ? raw[0] : raw;
  if (!scheme) {
    throw new Error("expoConfig.scheme is not set");
  }
  return scheme;
}

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    convexClient(),
    emailOTPClient(),
    Platform.OS === "web"
      ? crossDomainClient()
      : expoClient({
          scheme: resolveExpoScheme(),
          storagePrefix: resolveExpoScheme(),
          storage: SecureStore,
          webBrowserOptions: {
            preferEphemeralSession: true,
          },
        }),
  ],
});

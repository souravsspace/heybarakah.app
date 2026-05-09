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

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    convexClient(),
    emailOTPClient(),
    Platform.OS === "web"
      ? crossDomainClient()
      : expoClient({
          scheme: Constants.expoConfig?.scheme as string,
          storagePrefix: Constants.expoConfig?.scheme as string,
          storage: SecureStore,
          webBrowserOptions: {
            preferEphemeralSession: true,
          },
        }),
  ],
});

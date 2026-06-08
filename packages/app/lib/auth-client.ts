import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_BASE_URL } from "@/lib/cf-flag";

function resolveExpoScheme(): string {
  const raw = Constants.expoConfig?.scheme;
  const scheme = Array.isArray(raw) ? raw[0] : raw;
  if (!scheme) {
    throw new Error("expoConfig.scheme is not set");
  }
  return scheme;
}

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    emailOTPClient(),
    // Web rides the credentialed session cookie (CORS) directly, so it needs no
    // client plugin. Native uses the Expo client to store + replay Set-Cookie.
    ...(Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: resolveExpoScheme(),
            storagePrefix: resolveExpoScheme(),
            storage: SecureStore,
            webBrowserOptions: {
              preferEphemeralSession: true,
            },
          }),
        ]),
  ],
});

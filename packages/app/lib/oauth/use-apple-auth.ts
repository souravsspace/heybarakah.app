import * as AppleAuthentication from "expo-apple-authentication";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import { authClient } from "../auth-client";

export function useAppleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        "Apple sign-in unavailable",
        "Sign in with Apple is only available on iOS."
      );
      return false;
    }
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      Alert.alert(
        "Apple sign-in unavailable",
        "This device does not support Sign in with Apple."
      );
      return false;
    }
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert(
          "Apple sign-in failed",
          "Apple did not return an identity token."
        );
        return false;
      }

      const { data, error } = await authClient.signIn.social({
        provider: "apple",
        idToken: { token: credential.identityToken },
      });
      if (error) {
        console.error("[apple-oauth] error:", error);
        Alert.alert(
          "Apple sign-in failed",
          error.message ?? "Unknown error. Check Metro logs."
        );
        return false;
      }
      if (!data) {
        Alert.alert(
          "Apple sign-in did not complete",
          "Sign-in returned no session."
        );
        return false;
      }
      return true;
    } catch (error) {
      const isCancel =
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "ERR_REQUEST_CANCELED";
      if (isCancel) {
        return false;
      }
      console.error("[apple-oauth] threw:", error);
      Alert.alert(
        "Apple sign-in error",
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}

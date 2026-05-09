import * as AppleAuthentication from "expo-apple-authentication";
import { useState } from "react";
import { authClient } from "../auth-client";

export function useAppleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Failed to get Apple identity token");
      }

      await authClient.signIn.social({
        provider: "apple",
        idToken: { token: credential.identityToken },
      });
    } catch (error) {
      console.error("Apple sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}

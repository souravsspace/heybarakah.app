import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert } from "react-native";
import { authClient } from "../auth-client";

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    try {
      const callbackURL = Linking.createURL("");
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      if (error) {
        console.error("[google-oauth] error:", error);
        Alert.alert(
          "Google sign-in failed",
          error.message ?? "Unknown error. Check Metro logs."
        );
        return;
      }
      if (!data) {
        Alert.alert(
          "Google sign-in did not complete",
          "The browser closed before sign-in finished."
        );
      }
    } catch (error) {
      console.error("[google-oauth] threw:", error);
      Alert.alert(
        "Google sign-in error",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}

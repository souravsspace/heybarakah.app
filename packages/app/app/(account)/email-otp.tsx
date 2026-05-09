import { selectionAsync } from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { authClient } from "@/lib/auth-client";

const PRIMARY = "#29603E";
const INK = "#0F1311";

export default function EmailOtp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === "signup" ? "signup" : "signin";
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendCode() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed?.includes("@")) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }
    selectionAsync().catch(() => undefined);
    setIsLoading(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: trimmed,
      type: "sign-in",
    });
    setIsLoading(false);
    if (error) {
      Alert.alert("Could not send code", error.message ?? "Try again.");
      return;
    }
    setEmail(trimmed);
    setStep("code");
  }

  async function verify() {
    if (!code.trim() || code.trim().length < 4) {
      Alert.alert("Invalid code", "Enter the code from your email.");
      return;
    }
    selectionAsync().catch(() => undefined);
    setIsLoading(true);
    const { error } = await authClient.signIn.emailOtp({
      email,
      otp: code.trim(),
    });
    setIsLoading(false);
    if (error) {
      Alert.alert("Invalid code", error.message ?? "Try again.");
      return;
    }
    // user-context will pick up user; auth.tsx effect handles nav
    router.replace({
      pathname: "/(account)/auth",
      params: { mode },
    });
  }

  return (
    <ScreenShell scroll={false}>
      <FadeSlideIn className="flex-1">
        <View className="items-center px-sm" style={{ marginTop: 12, gap: 8 }}>
          <Headline>
            {step === "email" ? "Sign in with email" : "Enter the code"}
          </Headline>
          <BodyText className="px-sm" size="sm" tone="muted">
            {step === "email"
              ? "We will send a 6-digit code to verify it is you."
              : `Sent a code to ${email}.`}
          </BodyText>
        </View>

        <View style={{ marginTop: 36, gap: 14 }}>
          {step === "email" ? (
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              className="font-sans text-ink"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              style={{
                height: 60,
                borderRadius: 18,
                borderWidth: 1.5,
                borderColor: "#E5E7EB",
                paddingHorizontal: 18,
                fontSize: 16,
                color: INK,
              }}
              textContentType="emailAddress"
              value={email}
            />
          ) : (
            <TextInput
              autoComplete="one-time-code"
              autoFocus
              className="font-sans text-ink"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              style={{
                height: 60,
                borderRadius: 18,
                borderWidth: 1.5,
                borderColor: "#E5E7EB",
                paddingHorizontal: 18,
                fontSize: 22,
                letterSpacing: 6,
                textAlign: "center",
                color: INK,
              }}
              textContentType="oneTimeCode"
              value={code}
            />
          )}

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={step === "email" ? sendCode : verify}
            style={({ pressed }) => ({
              opacity: pressed || isLoading ? 0.92 : 1,
            })}
          >
            <View
              className="flex-row items-center justify-center"
              style={{
                height: 60,
                borderRadius: 18,
                backgroundColor: PRIMARY,
              }}
            >
              <Text
                className="font-sans"
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
              >
                {isLoading
                  ? "Please wait…"
                  : step === "email"
                    ? "Send code"
                    : "Verify"}
              </Text>
              {isLoading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                  style={{ marginLeft: 10 }}
                />
              ) : null}
            </View>
          </Pressable>

          {step === "code" ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setStep("email")}
              style={{ alignItems: "center", marginTop: 8 }}
            >
              <Text
                className="font-sans text-tertiary"
                style={{ fontSize: 13, textDecorationLine: "underline" }}
              >
                Use a different email
              </Text>
            </Pressable>
          ) : null}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

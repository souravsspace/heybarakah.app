import { selectionAsync } from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;
const RESEND_COOLDOWN_SECONDS = 30;

export default function EmailOtp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === "signup" ? "signup" : "signin";
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const id = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function requestOtp(target: string) {
    return await authClient.emailOtp.sendVerificationOtp({
      email: target,
      type: "sign-in",
    });
  }

  async function sendCode() {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }
    selectionAsync().catch(() => undefined);
    setIsLoading(true);
    try {
      const { error } = await requestOtp(trimmed);
      if (error) {
        Alert.alert("Could not send code", error.message ?? "Try again.");
        return;
      }
      setEmail(trimmed);
      setStep("code");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      Alert.alert(
        "Could not send code",
        "Check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    if (cooldown > 0 || isResending) {
      return;
    }
    selectionAsync().catch(() => undefined);
    setIsResending(true);
    try {
      const { error } = await requestOtp(email);
      if (error) {
        Alert.alert("Could not resend code", error.message ?? "Try again.");
        return;
      }
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      Alert.alert(
        "Could not resend code",
        "Check your connection and try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  async function verify() {
    if (!OTP_PATTERN.test(code.trim())) {
      Alert.alert("Invalid code", "Enter the 6-digit code from your email.");
      return;
    }
    selectionAsync().catch(() => undefined);
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp: code.trim(),
      });
      if (error) {
        Alert.alert("Invalid code", error.message ?? "Try again.");
        return;
      }
      // user-context will pick up user; auth.tsx effect handles nav
      router.replace({
        pathname: "/(account)/auth",
        params: { mode, verifying: "1" },
      });
    } catch {
      Alert.alert(
        "Could not verify code",
        "Check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
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
              accessibilityHint="Enter the email address for your Barakah account"
              accessibilityLabel="Email address"
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
              accessibilityHint="Enter the 6-digit code sent to your email"
              accessibilityLabel="Verification code"
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
            accessibilityState={{ busy: isLoading, disabled: isLoading }}
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
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  busy: isResending,
                  disabled: cooldown > 0 || isResending,
                }}
                disabled={cooldown > 0 || isResending}
                hitSlop={8}
                onPress={resendCode}
                style={{ alignItems: "center", marginTop: 8 }}
              >
                <Text
                  className="font-sans text-tertiary"
                  style={{
                    fontSize: 13,
                    textDecorationLine: cooldown > 0 ? "none" : "underline",
                    opacity: cooldown > 0 || isResending ? 0.5 : 1,
                  }}
                >
                  {isResending
                    ? "Resending…"
                    : cooldown > 0
                      ? `Resend code in ${cooldown}s`
                      : "Resend code"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  setStep("email");
                  setCode("");
                  setCooldown(0);
                }}
                style={{ alignItems: "center", marginTop: 4 }}
              >
                <Text
                  className="font-sans text-tertiary"
                  style={{ fontSize: 13, textDecorationLine: "underline" }}
                >
                  Use a different email
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { selectionAsync } from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { AuthLoading } from "@/components/auth-loading";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { LINKS } from "@/constants/links";
import { useUser } from "@/contexts/user-context";
import {
  type AuthProvider,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";
import { useAppleAuth } from "@/lib/oauth/use-apple-auth";
import { useGoogleAuth } from "@/lib/oauth/use-google-auth";
import { useSubscription } from "@/lib/subscription";

const PROVIDERS: {
  id: AuthProvider;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "apple", label: "Continue with Apple", icon: "logo-apple" },
  { id: "google", label: "Continue with Google", icon: "logo-google" },
  { id: "email", label: "Continue with Email", icon: "mail-outline" },
];

const PRIMARY = "#29603E";
const INK = "#0F1311";

type Mode = "signup" | "signin";

export default function Auth() {
  const { state, dispatch } = useOnboardingState();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; verifying?: string }>();
  const oAuthGoogle = useGoogleAuth();
  const oAuthApple = useAppleAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading, purchase } =
    useSubscription();
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(
    null
  );

  const mode: Mode = params.mode === "signup" ? "signup" : "signin";

  const handlingRef = useRef(false);

  function fillDefaultsIfWelcome(authProvider: AuthProvider) {
    const fromWelcome = !state.plan;
    if (fromWelcome) {
      dispatch({
        type: "SET_FIELD",
        payload: {
          authProvider,
          gender: state.gender ?? "male",
          madhab: state.madhab ?? "hanafi",
          consistency: state.consistency ?? "most",
          struggle: state.struggle ?? "phone",
          goal: state.goal ?? "all-five",
          calcMethod: state.calcMethod ?? "isna",
          strictness: state.strictness ?? "full-window",
          plan: "yearly",
          trialStartedAt: state.trialStartedAt ?? new Date().toISOString(),
          name: state.name,
        },
      });
    } else {
      dispatch({ type: "SET_FIELD", payload: { authProvider } });
    }
  }

  useEffect(() => {
    if (!user || isSubscriptionLoading || handlingRef.current) {
      return;
    }
    handlingRef.current = true;

    (async () => {
      try {
        if (activeSubscription) {
          if (mode === "signup") {
            router.replace("/success" as never);
            return;
          }
          if (!state.completedAt) {
            dispatch({ type: "COMPLETE" });
          }
          router.replace("/home");
          return;
        }

        const selectedPlan = state.plan;
        if (mode === "signup" && selectedPlan) {
          const result = await purchase(selectedPlan);
          if (result.ok) {
            router.replace("/success" as never);
            return;
          }
          if (!result.cancelled) {
            Alert.alert("Purchase failed", result.reason);
          }
          router.replace("/no-active-sub" as never);
          return;
        }

        router.replace("/no-active-sub" as never);
      } catch (error) {
        handlingRef.current = false;
        const message = error instanceof Error ? error.message : String(error);
        Alert.alert("Subscription error", message);
      }
    })();
  }, [
    user,
    isSubscriptionLoading,
    mode,
    activeSubscription,
    state.plan,
    state.completedAt,
    purchase,
    dispatch,
    router,
  ]);

  async function pick(provider: AuthProvider) {
    selectionAsync().catch(() => undefined);
    setPendingProvider(provider);
    fillDefaultsIfWelcome(provider);

    if (provider === "google") {
      const didStart = await oAuthGoogle.signIn();
      if (!didStart) {
        setPendingProvider(null);
      }
      return;
    }
    if (provider === "apple") {
      Alert.alert(
        "Apple sign-in unavailable",
        "Apple sign-in is not configured yet."
      );
      setPendingProvider(null);
      return;
    }
    router.push({
      pathname: "/(account)/email-otp",
      params: { mode },
    });
  }

  const loadingProvider =
    pendingProvider ??
    (oAuthGoogle.isLoading ? "google" : null) ??
    (oAuthApple.isLoading ? "apple" : null);
  const isOAuthLoading = loadingProvider !== null;
  const isVerifyingAuth = params.verifying === "1";

  if (isUserLoading || isOAuthLoading || isVerifyingAuth || user) {
    return <AuthLoading />;
  }

  const headline = mode === "signup" ? "Create your account" : "Welcome back.";
  const subline =
    mode === "signup"
      ? "You're all set. Create your account to save your progress."
      : "Sign in to sync your trial across devices.";

  return (
    <ScreenShell scroll={false}>
      <FadeSlideIn className="flex-1">
        <View className="items-center" style={{ marginTop: 12 }}>
          <BarakahMark color={PRIMARY} size={64} />
        </View>

        <View className="items-center px-sm" style={{ marginTop: 28, gap: 8 }}>
          <Headline>{headline}</Headline>
          <BodyText className="px-sm" size="sm" tone="muted">
            {subline}
          </BodyText>
        </View>

        <View style={{ marginTop: 36, gap: 14 }}>
          {PROVIDERS.map((p) => (
            <Pressable
              accessibilityLabel={p.label}
              accessibilityRole="button"
              accessibilityState={{
                busy: loadingProvider === p.id,
                disabled: isOAuthLoading,
              }}
              disabled={isOAuthLoading}
              key={p.id}
              onPress={() => pick(p.id)}
              style={({ pressed }) => ({
                opacity: pressed || isOAuthLoading ? 0.92 : 1,
              })}
            >
              <View
                className="flex-row items-center justify-center bg-surface"
                style={{
                  height: 60,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: "#E5E7EB",
                }}
              >
                {loadingProvider === p.id ? (
                  <ActivityIndicator color={INK} size="small" />
                ) : (
                  <>
                    <Ionicons
                      color={INK}
                      name={p.icon}
                      size={22}
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      className="font-sans text-ink"
                      style={{ fontSize: 16, fontWeight: "600" }}
                    >
                      {p.id === "email" && mode === "signup"
                        ? "Sign up with Email"
                        : p.label}
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View
          className="items-center px-sm"
          style={{ marginTop: "auto", paddingBottom: 16 }}
        >
          <Text
            className="text-center font-sans text-tertiary"
            style={{ fontSize: 12, lineHeight: 18 }}
          >
            By continuing you agree to the{" "}
            <Text
              accessibilityRole="link"
              className="text-ink"
              onPress={() => Linking.openURL(LINKS.terms)}
              style={{ fontWeight: "600", textDecorationLine: "underline" }}
            >
              Terms
            </Text>{" "}
            and{" "}
            <Text
              accessibilityRole="link"
              className="text-ink"
              onPress={() => Linking.openURL(LINKS.privacy)}
              style={{ fontWeight: "600", textDecorationLine: "underline" }}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

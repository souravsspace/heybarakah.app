import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { DevResetOnboarding } from "@/components/onboarding/dev-reset-onboarding";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { LINKS } from "@/constants/links";
import {
  POST_PURCHASE_ENTRY,
  POST_PURCHASE_FLOW,
} from "@/constants/onboarding-config";
import { useUser } from "@/contexts/user-context";
import {
  type AuthProvider,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";
import { hapticSelection } from "@/lib/haptics";
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
const SYNC_WAIT_MS = 15_000;

type Mode = "signup" | "signin";

export default function Auth() {
  const { state, dispatch } = useOnboardingState();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; verifying?: string }>();
  const oAuthGoogle = useGoogleAuth();
  const oAuthApple = useAppleAuth();
  const { user, isLoading: isUserLoading, profile } = useUser();
  const {
    activeSubscription,
    isSubscriptionLoading,
    offeringsLoading,
    revenueCatReady,
    purchase,
    claimMockSubscription,
  } = useSubscription();
  const purchaseCompletedAt = state.purchaseCompletedAt;
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

  const [syncWaitState, setSyncWaitState] = useState<
    "idle" | "waiting" | "expired"
  >("idle");

  useEffect(() => {
    if (syncWaitState !== "waiting") {
      return;
    }
    const timer = setTimeout(() => setSyncWaitState("expired"), SYNC_WAIT_MS);
    return () => clearTimeout(timer);
  }, [syncWaitState]);

  // Once access is granted (signed in with a sub, or a purchase just landed),
  // a buyer with no `users` row yet runs the post-purchase setup
  // (config + name + complete) before home. Routes through the onboarding group
  // — `(tabs)/success`/`(tabs)/name` are not NativeTabs triggers, so replacing
  // to them silently falls back to the home tab. Mirrors index.tsx recovery so
  // the in-session and cold-start flows match.
  const enterAfterPurchase = useCallback(() => {
    if (profile === null && !state.completedAt) {
      // Mobile in-app buyers (mode "signup") already finished the onboarding
      // config during the funnel, so they only need name + the completion
      // screen. Web (Polar) buyers signing in (mode "signin") never onboarded,
      // so they run the full post-purchase setup subset.
      if (mode === "signup") {
        router.replace("/(onboarding)/your-name" as never);
      } else {
        router.replace({
          pathname: POST_PURCHASE_ENTRY,
          params: { flow: POST_PURCHASE_FLOW },
        } as never);
      }
      return;
    }
    if (!state.completedAt) {
      dispatch({ type: "COMPLETE" });
    }
    router.replace("/home");
  }, [profile, state.completedAt, mode, dispatch, router]);

  useEffect(() => {
    if (
      !user ||
      isSubscriptionLoading ||
      profile === undefined ||
      handlingRef.current
    ) {
      return;
    }

    const selectedPlan = state.plan;
    const alreadyPurchased = Boolean(purchaseCompletedAt);
    const needsRevenueCat =
      mode === "signup" &&
      !activeSubscription &&
      !alreadyPurchased &&
      Boolean(selectedPlan);
    if (needsRevenueCat && (!revenueCatReady || offeringsLoading)) {
      return;
    }

    if (alreadyPurchased && !activeSubscription) {
      if (syncWaitState === "expired") {
        handlingRef.current = true;
        router.replace("/no-active-sub" as never);
        return;
      }
      if (syncWaitState === "idle") {
        setSyncWaitState("waiting");
      }
      return;
    }

    handlingRef.current = true;

    (async () => {
      try {
        if (activeSubscription) {
          enterAfterPurchase();
          return;
        }

        if (mode === "signup" && selectedPlan) {
          const result = await purchase(selectedPlan);
          if (result.ok) {
            enterAfterPurchase();
            return;
          }
          if (result.cancelled) {
            router.replace("/no-active-sub" as never);
            return;
          }
          if (__DEV__ && result.reason === "package-unavailable") {
            await claimMockSubscription(selectedPlan);
            enterAfterPurchase();
            return;
          }
          Alert.alert("Purchase failed", result.reason);
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
    profile,
    mode,
    activeSubscription,
    revenueCatReady,
    offeringsLoading,
    state.plan,
    purchaseCompletedAt,
    syncWaitState,
    purchase,
    claimMockSubscription,
    router,
    enterAfterPurchase,
  ]);

  useFocusEffect(
    useCallback(() => {
      setPendingProvider(null);
      handlingRef.current = false;
      setSyncWaitState("idle");
    }, [])
  );

  async function pick(provider: AuthProvider) {
    hapticSelection();
    fillDefaultsIfWelcome(provider);

    // Email leaves this screen for the OTP flow; don't put it into a loading
    // state (that would splash the screen behind the pushed route).
    if (provider === "email") {
      router.push({
        pathname: "/(account)/email-otp",
        params: { mode },
      });
      return;
    }

    setPendingProvider(provider);
    const didStart =
      provider === "google"
        ? await oAuthGoogle.signIn()
        : await oAuthApple.signIn();
    if (didStart) {
      // The native Apple sheet (and the returning in-app browser) does not
      // reliably fire a focus refetch, so the `["cf","me"]` account query stays
      // stale and the redirect effect never sees the new user — the button just
      // spins until an app restart. Force the account queries to refetch with
      // the freshly stored session cookie so `user` populates immediately.
      await queryClient.invalidateQueries({ queryKey: ["cf"] });
    } else {
      setPendingProvider(null);
    }
  }

  const loadingProvider =
    pendingProvider ??
    (oAuthGoogle.isLoading ? "google" : null) ??
    (oAuthApple.isLoading ? "apple" : null);
  const isOAuthLoading = loadingProvider !== null;
  const isVerifyingAuth = params.verifying === "1";

  // OAuth in flight keeps the buttons visible with a per-button spinner (see
  // `loadingProvider`/`disabled` below) instead of a full-screen splash, so a
  // dismissed Apple sheet or Google browser always recovers to a usable screen.
  // Full splash is reserved for real transitions: initial load, post-OTP
  // verification, or an already-signed-in user about to be routed.
  // Caption only on the actual login transition (verifying or a known user) —
  // not the plain initial query load, where nobody is signing in yet.
  const isLoggingIn = isVerifyingAuth || Boolean(user);
  if (isUserLoading || isVerifyingAuth || user) {
    return <AnimatedSplash caption={isLoggingIn ? "Logging in…" : undefined} />;
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
          <DevResetOnboarding />
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

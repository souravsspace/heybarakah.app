import { Ionicons } from "@expo/vector-icons";
import { selectionAsync } from "expo-haptics";
import { useRouter } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { LINKS } from "@/constants/links";
import {
  type AuthProvider,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";

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

export default function Auth() {
  const { state, dispatch } = useOnboardingState();
  const router = useRouter();

  function pick(provider: AuthProvider) {
    selectionAsync().catch(() => undefined);

    const fromWelcome = !state.plan;

    if (fromWelcome) {
      dispatch({
        type: "SET_FIELD",
        payload: {
          authProvider: provider,
          gender: state.gender ?? "male",
          madhab: state.madhab ?? "hanafi",
          consistency: state.consistency ?? "most",
          struggle: state.struggle ?? "phone",
          goal: state.goal ?? "all-five",
          calcMethod: state.calcMethod ?? "isna",
          strictness: state.strictness ?? "full-window",
          plan: "yearly",
          trialStartedAt: state.trialStartedAt ?? new Date().toISOString(),
          name: state.name ?? "Sana",
        },
      });
      dispatch({ type: "COMPLETE" });
      router.replace("/home");
      return;
    }

    dispatch({ type: "SET_FIELD", payload: { authProvider: provider } });
    router.push("/(account)/success");
  }

  return (
    <ScreenShell scroll={false}>
      <FadeSlideIn className="flex-1">
        <View className="items-center" style={{ marginTop: 12 }}>
          <BarakahMark color={PRIMARY} size={64} />
        </View>

        <View className="items-center px-sm" style={{ marginTop: 28, gap: 8 }}>
          <Headline>Welcome back.</Headline>
          <BodyText className="px-sm" size="sm" tone="muted">
            Sign in to sync your trial across devices.
          </BodyText>
        </View>

        <View style={{ marginTop: 36, gap: 14 }}>
          {PROVIDERS.map((p) => (
            <Pressable
              accessibilityRole="button"
              key={p.id}
              onPress={() => pick(p.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.92 : 1,
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
                  {p.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          className="items-center"
          hitSlop={8}
          style={{ marginTop: 22 }}
        >
          <Text
            className="font-sans text-tertiary"
            style={{ fontSize: 13, textDecorationLine: "underline" }}
          >
            Restore device purchase
          </Text>
        </Pressable>

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
              className="text-ink"
              onPress={() => Linking.openURL(LINKS.terms)}
              style={{ fontWeight: "600", textDecorationLine: "underline" }}
            >
              Terms
            </Text>{" "}
            and{" "}
            <Text
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

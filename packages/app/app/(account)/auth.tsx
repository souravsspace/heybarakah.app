import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { BrandMark } from "@/components/onboarding/illustrations/brand-mark";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import {
  type AuthProvider,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";

const PROVIDERS: {
  id: AuthProvider;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "google", label: "Continue with Google", icon: "logo-google" },
  { id: "apple", label: "Continue with Apple", icon: "logo-apple" },
  { id: "email", label: "Continue with Email", icon: "mail-outline" },
];

export default function Auth() {
  const { dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  function pick(provider: AuthProvider) {
    Haptics.selectionAsync().catch(() => {});
    dispatch({ type: "SET_FIELD", payload: { authProvider: provider } });
    next();
  }

  return (
    <ScreenShell
      hero={
        <FadeSlideIn>
          <BrandMark color="#FFFFFF" size={100} />
        </FadeSlideIn>
      }
      showBack={false}
      variant="filled-green"
    >
      <FadeSlideIn className="flex-1 gap-md" delay={120}>
        <View className="items-center gap-sm">
          <Text
            className="font-serif text-display text-surface text-center"
            style={{ fontWeight: "700" }}
          >
            Log in
          </Text>
          <Text className="font-sans text-body text-surface/80 text-center px-sm">
            Sync your trial across devices and never lose your progress.
          </Text>
        </View>

        <View className="gap-sm mt-md">
          {PROVIDERS.map((p) => (
            <Pressable
              className="flex-row items-center justify-center h-[60px] rounded-full bg-surface"
              key={p.id}
              onPress={() => pick(p.id)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Ionicons
                color="#000000"
                name={p.icon}
                size={20}
                style={{ marginRight: 10 }}
              />
              <Text
                className="font-sans text-label text-ink"
                style={{ fontWeight: "600" }}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable className="items-center mt-sm" hitSlop={8}>
          <Text className="font-sans text-body-sm text-surface/70 underline">
            Restore device purchase
          </Text>
        </Pressable>

        <Text className="font-sans text-caption text-surface/60 text-center mt-md px-sm">
          By continuing you agree to the Terms and acknowledge the Privacy
          Policy.
        </Text>
      </FadeSlideIn>
    </ScreenShell>
  );
}

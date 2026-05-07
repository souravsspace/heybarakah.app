import { useRouter } from "expo-router";
import { View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { MosqueTwin } from "@/components/onboarding/illustrations/mosque-twin";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";

export default function Success() {
  const router = useRouter();
  return (
    <ScreenShell
      footer={
        <Button
          label="Continue"
          onPress={() => router.push("/(account)/name")}
        />
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1 items-center justify-center" delay={80}>
        <View style={{ alignItems: "center", gap: 18 }}>
          <MosqueTwin size={392} />
          <View className="items-center px-md" style={{ gap: 8 }}>
            <Headline>You're set.</Headline>
            <BodyText className="px-sm" size="sm" tone="muted">
              Your prayer-lock is configured. One last step.
            </BodyText>
          </View>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

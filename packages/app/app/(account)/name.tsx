import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Name() {
  const { dispatch } = useOnboardingState();
  const router = useRouter();
  const [value, setValue] = useState("");

  function finish() {
    dispatch({
      type: "SET_FIELD",
      payload: { name: value.trim() || undefined },
    });
    dispatch({ type: "COMPLETE" });
    router.replace("/home");
  }

  return (
    <ScreenShell
      footer={
        <Button
          disabled={value.trim().length === 0}
          label="ENTER BARAKAH"
          onPress={finish}
        />
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1 justify-center" delay={80}>
        <View className="items-center px-sm" style={{ gap: 8 }}>
          <Headline>What should we {"\n"} call you?</Headline>
          <BodyText className="px-sm" size="sm" tone="muted">
            We'll use your name in du'a reminders.
          </BodyText>
        </View>
        <TextInput
          autoCapitalize="words"
          autoFocus
          className="border bg-surface font-sans text-ink"
          onChangeText={setValue}
          onSubmitEditing={finish}
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          returnKeyType="done"
          style={{
            marginTop: 28,
            borderColor: "#E5E7EB",
            borderWidth: 1.5,
            borderRadius: 18,
            paddingHorizontal: 18,
            paddingVertical: 18,
            fontSize: 18,
            fontWeight: "500",
          }}
          value={value}
        />
      </FadeSlideIn>
    </ScreenShell>
  );
}

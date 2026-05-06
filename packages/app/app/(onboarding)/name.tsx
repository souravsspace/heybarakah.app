import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { Button } from "@/components/ui/button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Name() {
  const { dispatch } = useOnboardingState();
  const router = useRouter();
  const [value, setValue] = useState("");

  function finish() {
    dispatch({ type: "SET_FIELD", payload: { name: value.trim() || undefined } });
    dispatch({ type: "COMPLETE" });
    router.replace("/home");
  }

  return (
    <ScreenShell
      showBack={false}
      footer={
        <Button
          label="ENTER BARAKAH"
          onPress={finish}
          disabled={value.trim().length === 0}
        />
      }
    >
      <FadeSlideIn className="flex-1 justify-center gap-md">
        <View className="items-center gap-sm">
          <Headline>What should we call you?</Headline>
          <BodyText tone="muted">A first name is enough.</BodyText>
        </View>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={finish}
          className="border border-neutral rounded-md px-md py-md text-body font-sans text-ink mt-md"
        />
      </FadeSlideIn>
    </ScreenShell>
  );
}

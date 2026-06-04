import { api } from "@barakah/core/convex/_generated/api";
import { useMutation } from "convex/react";
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
  const { state, dispatch } = useOnboardingState();
  const upsertProfile = useMutation(api.lib.users.upsertProfile);
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (saving) {
      return;
    }
    setSaving(true);
    const name = value.trim() || undefined;
    const completedAt = new Date().toISOString();
    try {
      // Persist the whole onboarding profile to Convex now and wait for it, so
      // the setup is saved server-side and never shown again on later sign-ins.
      await upsertProfile({
        name,
        gender: state.gender,
        madhab: state.madhab,
        consistency: state.consistency,
        struggle: state.struggle,
        goal: state.goal,
        calcMethod: state.calcMethod,
        strictness: state.strictness,
        locationGranted: state.locationGranted,
        notifGranted: state.notifGranted,
        prayersToLock: state.prayersToLock,
        completedAt,
      });
      dispatch({ type: "RESET" });
    } catch {
      // Save failed (e.g. offline): keep it locally so home.tsx retries upsert.
      dispatch({ type: "SET_FIELD", payload: { name } });
      dispatch({ type: "COMPLETE" });
    }
    router.replace("/home");
  }

  return (
    <ScreenShell
      footer={
        <Button
          disabled={value.trim().length === 0 || saving}
          label={saving ? "Saving…" : "ENTER BARAKAH"}
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

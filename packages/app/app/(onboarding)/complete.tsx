import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { MosqueGlow } from "@/components/onboarding/illustrations/mosque-glow";
import { SuccessCheck } from "@/components/onboarding/illustrations/success-check";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { captureError, captureEvent } from "@/lib/analytics";
import { api } from "@/lib/api-client";

export default function Complete() {
  const { state, dispatch } = useOnboardingState();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Mark setup complete the moment the user reaches this terminal screen. If
  // they close the app before tapping the button, `completedAt` sends them
  // straight to home on reopen (not back through onboarding), and home retries
  // the profile upsert from this saved state.
  useEffect(() => {
    dispatch({ type: "COMPLETE" });
  }, [dispatch]);

  async function finish() {
    if (saving) {
      return;
    }
    setSaving(true);
    const name = state.name?.trim() || undefined;
    const completedAt = new Date().toISOString();
    try {
      // Persist the whole onboarding profile to the API now and wait for it, so
      // the setup is saved server-side and never shown again on later sign-ins.
      const res = await api.api.v1.me.profile.$post({
        json: {
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
        },
      });
      if (!res.ok) {
        throw new Error("Failed to save profile");
      }
      await queryClient.invalidateQueries({ queryKey: ["cf", "me"] });
      captureEvent("onboarding completed", {
        consistency: state.consistency ?? null,
        goal: state.goal ?? null,
        prayersToLock: state.prayersToLock
          ? Object.values(state.prayersToLock).filter(Boolean).length
          : 0,
      });
      dispatch({ type: "RESET" });
    } catch (err) {
      // Save failed (e.g. offline): keep it locally so home.tsx retries upsert.
      captureError(err, { context: "onboarding_profile_save" });
      dispatch({ type: "SET_FIELD", payload: { name } });
      dispatch({ type: "COMPLETE" });
    }
    router.replace("/home");
  }

  return (
    <ScreenShell
      footer={
        <Button
          disabled={saving}
          label={saving ? "Saving…" : "ENTER BARAKAH"}
          onPress={finish}
        />
      }
      scroll={false}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MosqueGlow size={420} />
      </View>

      <View
        className="flex-1 items-center justify-center px-sm"
        style={{ gap: 8 }}
      >
        <FadeSlideIn delay={120}>
          <View className="items-center">
            <SuccessCheck size={88} />
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={320}>
          <View style={{ marginTop: 28 }}>
            <Headline>Your path is set.</Headline>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={620}>
          <View style={{ marginTop: 12 }}>
            <BodyText className="px-md" tone="muted">
              May Allah make your five a source of barakah and steadiness. Begin
              the return.
            </BodyText>
          </View>
        </FadeSlideIn>
      </View>
    </ScreenShell>
  );
}

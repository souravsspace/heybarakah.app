import { api } from "@barakah/core";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Home() {
  const { state, dispatch } = useOnboardingState();
  const { user } = useUser();
  const router = useRouter();
  const profile = useQuery(api.users.getMyProfile);
  const upsertProfile = useMutation(api.users.upsertProfile);
  const uploadedRef = useRef(false);

  useEffect(() => {
    if (uploadedRef.current) {
      return;
    }
    if (profile === undefined || !state.hydrated) {
      return;
    }
    if (profile === null && state.completedAt) {
      uploadedRef.current = true;
      upsertProfile({
        name: state.name,
        gender: state.gender,
        madhab: state.madhab,
        consistency: state.consistency,
        struggle: state.struggle,
        goal: state.goal,
        calcMethod: state.calcMethod,
        strictness: state.strictness,
        plan: state.plan,
        trialStartedAt: state.trialStartedAt,
        locationGranted: state.locationGranted,
        notifGranted: state.notifGranted,
        prayersToLock: state.prayersToLock,
        completedAt: state.completedAt,
      })
        .then(() => dispatch({ type: "RESET" }))
        .catch(() => {
          uploadedRef.current = false;
        });
      return;
    }
    if (profile !== null && (state.completedAt || state.gender)) {
      uploadedRef.current = true;
      dispatch({ type: "RESET" });
    }
  }, [profile, state, dispatch, upsertProfile]);

  const name =
    profile?.name?.trim() ||
    state.name?.trim() ||
    user?.name?.trim() ||
    "friend";
  const email = user?.email ?? null;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View
        className="flex-1 items-center justify-center px-md"
        style={{ gap: 14 }}
      >
        <Text
          className="text-center font-serif text-ink"
          style={{ fontSize: 28, lineHeight: 36 }}
        >
          Assalāmu ʿalaykum,{"\n"}
          {name}.
        </Text>
        {email ? (
          <View
            className="rounded-full bg-neutral-soft px-md py-[6px]"
            style={{ marginTop: 4 }}
          >
            <Text className="font-sans text-body-sm text-tertiary">
              {email}
            </Text>
          </View>
        ) : null}
        <Text className="px-sm text-center font-sans text-body-sm text-tertiary">
          Your prayer-lock is active. Five times a day, in shāʾ Allāh.
        </Text>
        <View style={{ marginTop: 24, width: "100%" }}>
          <Button
            label="LOG OUT"
            onPress={() => router.replace("/logging-out" as never)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

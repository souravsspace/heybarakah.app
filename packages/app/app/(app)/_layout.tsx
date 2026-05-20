import { Redirect, Stack } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import { DhikrProvider } from "@/contexts/dhikr-context";
import { useUser } from "@/contexts/user-context";
import { useDailyAyahNotification } from "@/hooks/useDailyAyahNotification";
import { useLockActivityScheduler } from "@/hooks/useLockActivityScheduler";
import { useWidgetSync } from "@/hooks/useWidgetSync";
import { useSubscription } from "@/lib/subscription";

function AuthedShell() {
  useDailyAyahNotification();
  useWidgetSync();
  useLockActivityScheduler();
  return (
    <DhikrProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="achievements" />
        <Stack.Screen
          name="dhikr-record"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
          }}
        />
      </Stack>
    </DhikrProvider>
  );
}

export default function AppLayout() {
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();

  if (isLoading || isSubscriptionLoading) {
    return <AuthLoading />;
  }
  if (!user) {
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }
  if (!activeSubscription) {
    return <Redirect href="/no-active-sub" />;
  }

  return <AuthedShell />;
}

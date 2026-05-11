import { Redirect, Stack } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import { useUser } from "@/contexts/user-context";
import { useSubscription } from "@/lib/subscription";

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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}

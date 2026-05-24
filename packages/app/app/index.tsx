import { Redirect } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import { useUser } from "@/contexts/user-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { useSubscription } from "@/lib/subscription";

export default function Index() {
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();
  const { state } = useOnboardingState();

  if (isLoading || isSubscriptionLoading || !state.hydrated) {
    return <AuthLoading />;
  }
  if (!user) {
    if (state.purchaseCompletedAt) {
      return <Redirect href={"/(account)/auth?mode=signup" as never} />;
    }
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }
  if (!activeSubscription) {
    return <Redirect href="/no-active-sub" />;
  }

  return <Redirect href="/home" />;
}

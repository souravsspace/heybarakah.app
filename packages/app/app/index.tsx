import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import {
  POST_PURCHASE_ENTRY,
  POST_PURCHASE_FLOW,
} from "@/constants/onboarding-config";
import { useUser } from "@/contexts/user-context";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { useSubscription } from "@/lib/subscription";

export default function Index() {
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();
  const { state } = useOnboardingState();
  const profile = useQuery(api.lib.users.getMyProfile);

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
  if (profile === undefined) {
    return <AuthLoading />;
  }
  // Subscribed (e.g. paid on the web) but no in-app profile yet: collect prayer
  // config, permissions, and name before entering the app.
  if (profile === null && !state.completedAt) {
    return (
      <Redirect
        href={
          {
            pathname: POST_PURCHASE_ENTRY,
            params: { flow: POST_PURCHASE_FLOW },
          } as never
        }
      />
    );
  }

  return <Redirect href="/home" />;
}

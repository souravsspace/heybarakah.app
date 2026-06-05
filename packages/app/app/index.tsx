import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { useEffect, useRef } from "react";
import { AnimatedSplash } from "@/components/splash/animated-splash";
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
  const { state, dispatch } = useOnboardingState();
  const profile = useQuery(api.lib.users.getMyProfile);

  const ready = !(isLoading || isSubscriptionLoading) && state.hydrated;
  // A signed-out user with no paywall/purchase marker either never started or
  // only got partway through onboarding. Wipe any stale partial progress so the
  // welcome flow begins clean. Ref-guarded to fire once and avoid a reset loop.
  const didReset = useRef(false);
  const isPartialOnboarding =
    ready && !user && !state.purchaseCompletedAt && !state.paywallReachedAt;
  useEffect(() => {
    if (isPartialOnboarding && !didReset.current) {
      didReset.current = true;
      dispatch({ type: "RESET" });
    }
  }, [isPartialOnboarding, dispatch]);

  if (!ready) {
    return <AnimatedSplash />;
  }
  if (!user) {
    // Paid (e.g. just purchased, or paid before and reopened): finish by
    // creating the account. Survives app restarts until they sign up.
    if (state.purchaseCompletedAt) {
      return <Redirect href={"/(account)/auth?mode=signup" as never} />;
    }
    // Reached the paywall but did not pay: resume there instead of restarting.
    if (state.paywallReachedAt) {
      return <Redirect href={"/(onboarding)/paywall/try-free" as never} />;
    }
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }
  if (!activeSubscription) {
    return <Redirect href="/no-active-sub" />;
  }
  if (profile === undefined) {
    return <AnimatedSplash />;
  }
  // Subscribed (e.g. paid on the web) but no in-app profile yet: collect prayer
  // config, permissions, and name once. A `users` row is only ever created at
  // `/name` completion or later settings/avatar edits (both reachable only after
  // home), so an existing row means onboarding is already done. The local
  // completedAt bridges the window before the freshly-saved row reaches the cache.
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

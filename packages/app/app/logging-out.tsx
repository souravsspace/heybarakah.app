import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { authClient } from "@/lib/auth-client";
import { resetOfflineQueue } from "@/lib/offline-queue";
import { logOutRevenueCat } from "@/lib/revenuecat";

export default function LoggingOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { dispatch } = useOnboardingState();

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    // Reset onboarding up front so it runs even if a gate redirects us before
    // the async cleanup below resolves.
    dispatch({ type: "RESET" });
    (async () => {
      // Order matters. Sign out (clears the session cookie) and drop the cached
      // account FIRST so `user` becomes null before anything touches the
      // subscription. Two reasons:
      //   1. The auth gates (`(app)/_layout`, `index`) check `!user` before
      //      `!activeSubscription`, so a null user routes to welcome — never to
      //      `no-active-sub`.
      //   2. RevenueCat's logout fires the customer-info listener, which only
      //      re-syncs the entitlement while `userId` is set. Clearing the user
      //      first makes that listener a no-op, so it can't null the
      //      subscription while the user still looks signed in (which is what
      //      bounced us to `no-active-sub`).
      try {
        await authClient.signOut();
      } catch {
        // ignore
      }
      // Force the cache to a signed-out state instead of refetching.
      // `@better-auth/expo` keeps the session cookie in memory for the rest of
      // the process even after `signOut` clears SecureStore, so a refetch here
      // would replay that cookie, return the old user, and the onboarding layout
      // would bounce us to /home. Setting null deterministically (and cancelling
      // any in-flight fetch) keeps `user` null until the next cold start.
      await queryClient.cancelQueries({ queryKey: ["cf"] });
      queryClient.setQueryData(["cf", "me"], { user: null, profile: null });
      queryClient.setQueryData(["cf", "subscription"], null);
      try {
        await logOutRevenueCat();
      } catch {
        // ignore
      }
      await resetOfflineQueue();
      if (!mounted.current) {
        return;
      }
      router.replace("/(onboarding)/welcome" as never);
    })();
    return () => {
      mounted.current = false;
    };
  }, [dispatch, router, queryClient]);

  // AnimatedSplash (loader mode) renders in a full-screen Modal, which blocks
  // the tab bar, back gesture, and any navigation while signing out. Lives at
  // the app root (not the `(app)` group) so the subscription/user gating cannot
  // redirect it to `no-active-sub` while RevenueCat logout clears the sub.
  return <AnimatedSplash caption="Logging out…" />;
}

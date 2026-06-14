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
    (async () => {
      try {
        await logOutRevenueCat();
      } catch {
        // ignore
      }
      try {
        await authClient.signOut();
      } catch {
        // ignore
      }
      await resetOfflineQueue();
      // Drop the cached signed-in account so no stale `user`/subscription can
      // bounce the now-signed-out app back into a gated screen.
      queryClient.removeQueries({ queryKey: ["cf"] });
      if (!mounted.current) {
        return;
      }
      dispatch({ type: "RESET" });
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

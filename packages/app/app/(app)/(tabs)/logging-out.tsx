import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AnimatedSplash } from "@/components/splash/animated-splash";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { authClient } from "@/lib/auth-client";
import { logOutRevenueCat } from "@/lib/revenuecat";

export default function LoggingOut() {
  const router = useRouter();
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
      if (!mounted.current) {
        return;
      }
      dispatch({ type: "RESET" });
      router.replace("/(onboarding)/welcome" as never);
    })();
    return () => {
      mounted.current = false;
    };
  }, [dispatch, router]);

  // AnimatedSplash (loader mode) renders in a full-screen Modal, which blocks
  // the tab bar, back gesture, and any navigation while signing out.
  return <AnimatedSplash caption="Logging out…" />;
}

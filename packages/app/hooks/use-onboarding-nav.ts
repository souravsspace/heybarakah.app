import { useGlobalSearchParams, useRouter, useSegments } from "expo-router";
import { useMemo } from "react";
import {
  ONBOARDING_ROUTES,
  type OnboardingRoute,
  POST_PURCHASE_FLOW,
  POST_PURCHASE_ROUTES,
} from "@/constants/onboarding-config";

export function useOnboardingNav() {
  const router = useRouter();
  const segments = useSegments();
  const params = useGlobalSearchParams<{ flow?: string }>();
  const isPostPurchase = params.flow === POST_PURCHASE_FLOW;
  const routes: readonly OnboardingRoute[] = isPostPurchase
    ? POST_PURCHASE_ROUTES
    : ONBOARDING_ROUTES;

  const currentPath = useMemo(() => {
    const segs = segments as readonly string[];
    if (segs[0] !== "(onboarding)") {
      return null;
    }
    const rest = segs.slice(1).join("/");
    return `/(onboarding)/${rest}` as OnboardingRoute;
  }, [segments]);

  const index = currentPath ? routes.indexOf(currentPath) : -1;
  const total = routes.length;
  const progressEndIndex = isPostPurchase
    ? total - 1
    : routes.indexOf("/(onboarding)/paywall/akhira-worth" as OnboardingRoute);
  const progressDenom = progressEndIndex >= 0 ? progressEndIndex + 1 : total;
  const progress = index >= 0 ? Math.min(1, (index + 1) / progressDenom) : 0;

  function next() {
    if (index < 0) {
      return;
    }
    // Post-purchase setup ends at the name screen, which lives outside the
    // onboarding group and finalizes the profile.
    if (isPostPurchase && index >= total - 1) {
      router.push("/name" as never);
      return;
    }
    if (index >= total - 1) {
      return;
    }
    const target = routes[index + 1];
    if (isPostPurchase) {
      router.push({
        pathname: target,
        params: { flow: POST_PURCHASE_FLOW },
      } as never);
      return;
    }
    router.push(target as never);
  }

  function back() {
    if (index <= 0) {
      return;
    }
    router.back();
  }

  function goTo(route: OnboardingRoute | string) {
    router.push(route as never);
  }

  return { index, total, progress, next, back, goTo, currentPath };
}

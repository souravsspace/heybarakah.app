import { useRouter, useSegments } from "expo-router";
import { useMemo } from "react";
import { ONBOARDING_ROUTES, type OnboardingRoute } from "@/constants/onboarding-config";

export function useOnboardingNav() {
  const router = useRouter();
  const segments = useSegments();

  const currentPath = useMemo(() => {
    const segs = segments as readonly string[];
    if (segs[0] !== "(onboarding)") return null;
    const rest = segs.slice(1).join("/");
    return `/(onboarding)/${rest}` as OnboardingRoute;
  }, [segments]);

  const index = currentPath ? ONBOARDING_ROUTES.indexOf(currentPath) : -1;
  const total = ONBOARDING_ROUTES.length;
  const progressEndIndex = ONBOARDING_ROUTES.indexOf(
    "/(onboarding)/paywall/akhira-worth"
  );
  const progressDenom =
    progressEndIndex >= 0 ? progressEndIndex + 1 : total;
  const progress =
    index >= 0 ? Math.min(1, (index + 1) / progressDenom) : 0;

  function next() {
    if (index < 0 || index >= total - 1) return;
    router.push(ONBOARDING_ROUTES[index + 1] as never);
  }

  function back() {
    if (index <= 0) return;
    router.back();
  }

  function goTo(route: OnboardingRoute | string) {
    router.push(route as never);
  }

  return { index, total, progress, next, back, goTo, currentPath };
}

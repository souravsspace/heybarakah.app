import { env } from "@barakah/env/app";
import PostHog from "posthog-react-native";

// Exact JSON-safe property bag PostHog accepts, derived from the SDK method so
// it tracks the SDK without importing `@posthog/core` internals (transitive).
type EventProperties = NonNullable<Parameters<PostHog["capture"]>[1]>;

// Mirrors the guarded, optional pattern in lib/revenuecat.ts: with no
// EXPO_PUBLIC_POSTHOG_KEY the client is null and every helper is a no-op, so
// the app runs identically without analytics configured (dev, OSS forks, CI).

const DEFAULT_HOST = "https://us.i.posthog.com";

function createClient(): PostHog | null {
  const apiKey = env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    return null;
  }
  return new PostHog(apiKey, {
    host: env.EXPO_PUBLIC_POSTHOG_HOST ?? DEFAULT_HOST,
    // Auto-track Application Opened/Backgrounded.
    captureAppLifecycleEvents: true,
    // Touch/screen autocapture is wired by PostHogProvider in
    // app/_layout.tsx, which reuses this same client.
    enableSessionReplay: false,
  });
}

/** Shared client. `null` when no key is configured. */
export const posthog: PostHog | null = createClient();

export function isAnalyticsEnabled(): boolean {
  return posthog !== null;
}

/** Track a business event. Use `[object] [verb]` naming, e.g. `prayer logged`. */
export function captureEvent(
  event: string,
  properties?: EventProperties
): void {
  posthog?.capture(event, properties);
}

/** Associate subsequent events with a signed-in user. */
export function identifyUser(
  distinctId: string,
  properties?: EventProperties
): void {
  posthog?.identify(distinctId, properties);
}

/** Clear the identified user on logout so events go back to anonymous. */
export function resetAnalytics(): void {
  posthog?.reset();
}

/**
 * Send a caught error to PostHog error tracking. Swallows its own failures so
 * reporting an error can never itself throw (would mask the original).
 */
export function captureError(
  error: unknown,
  properties?: EventProperties
): void {
  if (!posthog) {
    return;
  }
  const err = error instanceof Error ? error : new Error(String(error));
  try {
    posthog.captureException(err, properties);
  } catch {
    // ignore — never let error reporting crash the caller
  }
}

interface RnErrorUtils {
  getGlobalHandler?: () =>
    | ((error: unknown, isFatal?: boolean) => void)
    | undefined;
  setGlobalHandler: (
    handler: (error: unknown, isFatal?: boolean) => void
  ) => void;
}

// Keyed on the ErrorUtils object itself (not a module variable) so dev Fast
// Refresh — which re-evaluates this module but keeps globalThis — can't stack
// duplicate wrappers and report each uncaught error N times.
const INSTALLED_FLAG = "__barakahPosthogHandler__";

/**
 * Route uncaught JS errors to PostHog. Wraps React Native's global ErrorUtils
 * handler so the red box / native crash flow still runs after we report.
 * Render errors are covered separately by the root ErrorBoundary.
 */
export function setupGlobalErrorTracking(): void {
  if (!posthog) {
    return;
  }
  const errorUtils = (globalThis as unknown as { ErrorUtils?: RnErrorUtils })
    .ErrorUtils as (RnErrorUtils & Record<string, unknown>) | undefined;
  if (!errorUtils || errorUtils[INSTALLED_FLAG]) {
    return;
  }
  errorUtils[INSTALLED_FLAG] = true;
  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error, isFatal) => {
    captureError(error, { fatal: isFatal === true, source: "global_handler" });
    previous?.(error, isFatal);
  });
}

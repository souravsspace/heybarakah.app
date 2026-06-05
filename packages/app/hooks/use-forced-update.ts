import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import { nativeApplicationVersion } from "expo-application";

import { semverLt } from "@/lib/semver";

interface ForcedUpdate {
  blocked: boolean;
  currentVersion: string;
  storeUrl: string;
}

/**
 * Reactive store-version force-update gate (iOS).
 * Blocks when the installed native version is below `minSupportedVersion`
 * from Convex. The query is live, so flipping the value in the backend
 * blocks every open client without shipping a build.
 */
export function useForcedUpdate(): ForcedUpdate {
  const config = useQuery(api.lib.appConfig.getAppConfig);
  const currentVersion = nativeApplicationVersion ?? "0.0.0";

  if (!config) {
    return { blocked: false, currentVersion, storeUrl: "" };
  }

  return {
    blocked: semverLt(currentVersion, config.minSupportedVersion),
    currentVersion,
    storeUrl: config.iosStoreUrl,
  };
}

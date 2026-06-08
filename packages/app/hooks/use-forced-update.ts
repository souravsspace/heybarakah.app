import { useQuery as useRqQuery } from "@tanstack/react-query";
import { nativeApplicationVersion } from "expo-application";

import { api } from "@/lib/api-client";
import { semverLt } from "@/lib/semver";

interface ForcedUpdate {
  blocked: boolean;
  currentVersion: string;
  storeUrl: string;
}

interface AppConfig {
  iosStoreUrl: string;
  minSupportedVersion: string;
}

function toForcedUpdate(
  config: AppConfig | null | undefined,
  currentVersion: string
): ForcedUpdate {
  if (!config) {
    return { blocked: false, currentVersion, storeUrl: "" };
  }
  return {
    blocked: semverLt(currentVersion, config.minSupportedVersion),
    currentVersion,
    storeUrl: config.iosStoreUrl,
  };
}

/**
 * Store-version force-update gate (iOS). Blocks when the installed native
 * version is below `minSupportedVersion` from the API; refetched on focus so
 * flipping the value blocks open clients without shipping a build.
 */
export function useForcedUpdate(): ForcedUpdate {
  const query = useRqQuery({
    queryKey: ["cf", "app-config"],
    queryFn: async (): Promise<AppConfig | null> => {
      const res = await api.api.v1["app-config"].$get();
      if (!res.ok) {
        throw new Error("Failed to load app config");
      }
      return await res.json();
    },
  });
  return toForcedUpdate(query.data, nativeApplicationVersion ?? "0.0.0");
}

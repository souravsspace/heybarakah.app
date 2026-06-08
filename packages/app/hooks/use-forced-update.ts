import { api as convexApi } from "@barakah/core/convex/_generated/api";
import { useQuery as useRqQuery } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { nativeApplicationVersion } from "expo-application";

import { api } from "@/lib/api-client";
import { USE_CF_API } from "@/lib/cf-flag";
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
 * Reactive store-version force-update gate (iOS).
 * Blocks when the installed native version is below `minSupportedVersion`
 * from the backend. The query is live, so flipping the value in the backend
 * blocks every open client without shipping a build.
 */
function useForcedUpdateConvex(): ForcedUpdate {
  const config = useQuery(convexApi.lib.appConfig.getAppConfig);
  return toForcedUpdate(config, nativeApplicationVersion ?? "0.0.0");
}

function useForcedUpdateCf(): ForcedUpdate {
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

export const useForcedUpdate = USE_CF_API
  ? useForcedUpdateCf
  : useForcedUpdateConvex;

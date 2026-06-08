import { api as convexApi } from "@barakah/core/convex/_generated/api";
import { useMutation } from "convex/react";
import { useMemo } from "react";
import { CLEAR_PRAYER_KIND, LOG_PRAYER_KIND } from "@/hooks/usePrayerLogs";
import { api } from "@/lib/api-client";
import { USE_CF_API } from "@/lib/cf-flag";
import { type MutationHandler, useOfflineReplay } from "@/lib/offline-queue";
import {
  UPSERT_ANDROID_KIND,
  UPSERT_IOS_KIND,
} from "@/lib/shield-selection-offline";

type Handlers = Record<string, MutationHandler>;

function useOfflineHandlersConvex(): Handlers {
  const logPrayer = useMutation(convexApi.lib.prayerLogs.logPrayer);
  const clearPrayer = useMutation(convexApi.lib.prayerLogs.clearPrayer);
  const upsertIos = useMutation(convexApi.lib.shieldSelection.upsertIos);
  const upsertAndroid = useMutation(
    convexApi.lib.shieldSelection.upsertAndroid
  );

  return useMemo<Handlers>(
    () => ({
      [LOG_PRAYER_KIND]: (args) => logPrayer(args as never),
      [CLEAR_PRAYER_KIND]: (args) => clearPrayer(args as never),
      [UPSERT_IOS_KIND]: (args) => upsertIos(args as never),
      [UPSERT_ANDROID_KIND]: (args) => upsertAndroid(args as never),
    }),
    [logPrayer, clearPrayer, upsertIos, upsertAndroid]
  );
}

function useOfflineHandlersCf(): Handlers {
  return useMemo<Handlers>(() => {
    const post = async (
      res: Promise<{ ok: boolean }>,
      label: string
    ): Promise<void> => {
      const r = await res;
      if (!r.ok) {
        throw new Error(`Failed to replay ${label}`);
      }
    };
    return {
      [LOG_PRAYER_KIND]: (args) =>
        post(
          api.api.v1["prayer-logs"].$post({ json: args as never }),
          "logPrayer"
        ),
      [CLEAR_PRAYER_KIND]: (args) =>
        post(
          api.api.v1["prayer-logs"].clear.$post({ json: args as never }),
          "clearPrayer"
        ),
      [UPSERT_IOS_KIND]: (args) =>
        post(
          api.api.v1.shield.ios.$post({ json: args as never }),
          "shield/ios"
        ),
      [UPSERT_ANDROID_KIND]: (args) =>
        post(
          api.api.v1.shield.android.$post({ json: args as never }),
          "shield/android"
        ),
    };
  }, []);
}

const useOfflineHandlers = USE_CF_API
  ? useOfflineHandlersCf
  : useOfflineHandlersConvex;

/** Replays mutations that were queued while offline once the device reconnects.
 *  All mapped mutations are idempotent, so a replayed op is safe to re-apply. */
export function useOfflineSync(): void {
  useOfflineReplay(useOfflineHandlers());
}

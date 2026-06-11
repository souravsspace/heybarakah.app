import { useMemo } from "react";
import { CLEAR_PRAYER_KIND, LOG_PRAYER_KIND } from "@/hooks/usePrayerLogs";
import { api } from "@/lib/api-client";
import { type MutationHandler, useOfflineReplay } from "@/lib/offline-queue";
import {
  UPSERT_ANDROID_KIND,
  UPSERT_IOS_KIND,
} from "@/lib/shield-selection-offline";

type Handlers = Record<string, MutationHandler>;

function useOfflineHandlers(): Handlers {
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

/** Replays mutations that were queued while offline once the device reconnects.
 *  All mapped mutations are idempotent, so a replayed op is safe to re-apply. */
export function useOfflineSync(): void {
  useOfflineReplay(useOfflineHandlers());
}

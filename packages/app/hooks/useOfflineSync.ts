import { api } from "@barakah/core/convex/_generated/api";
import { useMutation } from "convex/react";
import { useMemo } from "react";
import { CLEAR_PRAYER_KIND, LOG_PRAYER_KIND } from "@/hooks/usePrayerLogs";
import { type MutationHandler, useOfflineReplay } from "@/lib/offline-queue";
import {
  UPSERT_ANDROID_KIND,
  UPSERT_IOS_KIND,
} from "@/lib/shield-selection-offline";

/** Replays mutations that were queued while offline once the device reconnects.
 *  All mapped mutations are idempotent, so a replayed op is safe to re-apply. */
export function useOfflineSync(): void {
  const logPrayer = useMutation(api.lib.prayerLogs.logPrayer);
  const clearPrayer = useMutation(api.lib.prayerLogs.clearPrayer);
  const upsertIos = useMutation(api.lib.shieldSelection.upsertIos);
  const upsertAndroid = useMutation(api.lib.shieldSelection.upsertAndroid);

  const handlers = useMemo<Record<string, MutationHandler>>(
    () => ({
      [LOG_PRAYER_KIND]: (args) => logPrayer(args as never),
      [CLEAR_PRAYER_KIND]: (args) => clearPrayer(args as never),
      [UPSERT_IOS_KIND]: (args) => upsertIos(args as never),
      [UPSERT_ANDROID_KIND]: (args) => upsertAndroid(args as never),
    }),
    [logPrayer, clearPrayer, upsertIos, upsertAndroid]
  );

  useOfflineReplay(handlers);
}

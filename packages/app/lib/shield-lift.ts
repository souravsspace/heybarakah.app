import type { PrayerWindow } from "@barakah/core/shieldSelection";
import { temporaryUnlock } from "@/lib/app-blocker";
import {
  remainingShieldMinutes,
  type Timings,
} from "@/lib/prayer-shield-windows";

// Free the blocked apps for the rest of `prayer`'s shield window. No-op outside
// the window, where nothing is shielded. Never rejects: the shield is a
// best-effort native side effect and must not fail the caller's flow.
export async function liftShieldForPrayer(
  prayer: PrayerWindow,
  timings: Timings | null | undefined
): Promise<void> {
  const minutes = remainingShieldMinutes(prayer, timings);
  if (minutes === 0) {
    return;
  }
  await temporaryUnlock(minutes).catch(() => undefined);
}

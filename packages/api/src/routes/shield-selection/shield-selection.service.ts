import { eq } from "drizzle-orm";

import type { Database } from "@/db";
import { shieldSelection } from "@/db/schema";

// Local copy of core src/shieldSelection/validators ALL_WINDOWS — avoids pulling
// `convex/values` (used by that module) into the Worker bundle.
export const ALL_WINDOWS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerWindow = (typeof ALL_WINDOWS)[number];

export const MAX_IOS_SELECTION_BYTES = 100_000;
export const MAX_ANDROID_PACKAGES = 200;
export const MAX_PACKAGE_NAME_LENGTH = 256;
const DEFAULT_WINDOWS: PrayerWindow[] = [...ALL_WINDOWS];

async function findMine(db: Database, authUserId: string) {
  const [row] = await db
    .select()
    .from(shieldSelection)
    .where(eq(shieldSelection.authUserId, authUserId))
    .limit(1);
  return row;
}

export function getMine(db: Database, authUserId: string) {
  return findMine(db, authUserId);
}

export async function upsertIos(
  db: Database,
  authUserId: string,
  args: { iosSelectionData: string; iosItemCount: number }
): Promise<void> {
  const now = Date.now();
  const enabled = args.iosItemCount > 0;
  // Atomic upsert keyed on the UNIQUE authUserId — a racing first write resolves
  // to the update branch instead of inserting a second selection row.
  await db
    .insert(shieldSelection)
    .values({
      authUserId,
      iosSelectionData: args.iosSelectionData,
      iosItemCount: args.iosItemCount,
      windows: DEFAULT_WINDOWS,
      enabled,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: shieldSelection.authUserId,
      set: {
        iosSelectionData: args.iosSelectionData,
        iosItemCount: args.iosItemCount,
        enabled,
        updatedAt: now,
      },
    });
}

export async function upsertAndroid(
  db: Database,
  authUserId: string,
  androidPackageNames: string[]
): Promise<void> {
  const now = Date.now();
  const enabled = androidPackageNames.length > 0;
  await db
    .insert(shieldSelection)
    .values({
      authUserId,
      androidPackageNames,
      windows: DEFAULT_WINDOWS,
      enabled,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: shieldSelection.authUserId,
      set: { androidPackageNames, enabled, updatedAt: now },
    });
}

export async function setWindows(
  db: Database,
  authUserId: string,
  windows: PrayerWindow[]
): Promise<void> {
  const existing = await findMine(db, authUserId);
  if (!existing) {
    return;
  }
  await db
    .update(shieldSelection)
    .set({ windows, updatedAt: Date.now() })
    .where(eq(shieldSelection.authUserId, authUserId));
}

export async function setEnabled(
  db: Database,
  authUserId: string,
  enabled: boolean
): Promise<void> {
  const existing = await findMine(db, authUserId);
  if (!existing) {
    return;
  }
  await db
    .update(shieldSelection)
    .set({ enabled, updatedAt: Date.now() })
    .where(eq(shieldSelection.authUserId, authUserId));
}

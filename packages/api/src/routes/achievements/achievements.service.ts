import {
  ACHIEVEMENTS,
  type AchievementCode,
  evaluateAchievements,
} from "@barakah/core/achievements";
import { and, desc, eq } from "drizzle-orm";

import type { Database } from "@/db";
import {
  dhikrAggregate,
  dhikrDaily,
  prayerLogs,
  prayerTimeCaches,
  userAchievements,
  users,
} from "@/db/schema";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TIMEZONE = "UTC";
const EVALUATE_PRAYER_LOG_LIMIT = 5000;
const EVALUATE_DHIKR_DAILY_LIMIT = 10_000;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function utcToday(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function localToday(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      timeZone: timezone,
      year: "numeric",
    }).formatToParts(new Date());
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    return utcToday();
  }
  return utcToday();
}

async function dhikrTotalForUser(
  db: Database,
  authUserId: string
): Promise<number> {
  const [aggregate] = await db
    .select({ total: dhikrAggregate.total })
    .from(dhikrAggregate)
    .where(eq(dhikrAggregate.authUserId, authUserId))
    .limit(1);
  if (aggregate) {
    return aggregate.total;
  }
  const rows = await db
    .select({ count: dhikrDaily.count })
    .from(dhikrDaily)
    .where(eq(dhikrDaily.authUserId, authUserId))
    .limit(EVALUATE_DHIKR_DAILY_LIMIT);
  return rows.reduce((sum, row) => sum + row.count, 0);
}

/**
 * Ports convex/lib/achievements.ts `runEvaluate` (internalMutation). Evaluates
 * the user's achievements from their prayer logs + dhikr total and inserts any
 * newly unlocked rows. Called inside `dhikr.increment` + `prayerLogs.logPrayer`.
 * Returns the codes inserted this run (empty if none / profile missing).
 */
export async function runEvaluate(
  db: Database,
  { authUserId, today }: { authUserId: string; today?: string }
): Promise<AchievementCode[]> {
  const [tzRow] = await db
    .select({ timezone: prayerTimeCaches.timezone })
    .from(prayerTimeCaches)
    .where(eq(prayerTimeCaches.userId, authUserId))
    .orderBy(desc(prayerTimeCaches.updatedAt))
    .limit(1);
  const timezone = tzRow?.timezone ?? DEFAULT_TIMEZONE;
  const dateKey =
    today && DATE_KEY_PATTERN.test(today) ? today : localToday(timezone);

  const [logs, dhikrTotal, profileRows, existing] = await Promise.all([
    db
      .select()
      .from(prayerLogs)
      .where(eq(prayerLogs.authUserId, authUserId))
      .orderBy(desc(prayerLogs.updatedAt))
      .limit(EVALUATE_PRAYER_LOG_LIMIT),
    dhikrTotalForUser(db, authUserId),
    db.select().from(users).where(eq(users.authUserId, authUserId)).limit(1),
    db
      .select({ code: userAchievements.code })
      .from(userAchievements)
      .where(eq(userAchievements.authUserId, authUserId))
      .limit(ACHIEVEMENTS.length + 10),
  ]);

  // Skip if the profile is gone — a delete-account purge can race with an
  // evaluate and would otherwise re-insert rows for a deleted user.
  const profile = profileRows[0];
  if (!profile) {
    return [];
  }

  const alreadyUnlocked = new Set<AchievementCode>(
    existing.map((row) => row.code as AchievementCode)
  );

  const newly = evaluateAchievements(
    {
      onboardingComplete: Boolean(profile.completedAt),
      prayerLogs: logs.map((l) => ({
        date: l.date,
        prayer: l.prayer,
        status: l.status,
        prayedAt: l.prayedAt ?? undefined,
        updatedAt: l.updatedAt,
      })),
      dhikrTotal,
      today: dateKey,
      timezone,
    },
    alreadyUnlocked
  );

  if (newly.length === 0) {
    return [];
  }

  const now = Date.now();
  const inserted: AchievementCode[] = [];
  for (const code of newly) {
    const [dup] = await db
      .select({ id: userAchievements.id })
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.authUserId, authUserId),
          eq(userAchievements.code, code)
        )
      )
      .limit(1);
    if (dup) {
      continue;
    }
    await db
      .insert(userAchievements)
      .values({ authUserId, code, unlockedAt: now });
    inserted.push(code);
  }
  return inserted;
}

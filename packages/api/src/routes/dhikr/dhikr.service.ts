import { and, eq, sql } from "drizzle-orm";

import type { Database } from "@/db";
import { dhikrAggregate, dhikrDaily } from "@/db/schema";

import { runEvaluate } from "@/routes/achievements/achievements.service";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DEFAULT_TARGET = 33;
export const MAX_TARGET = 10_000;
export const MAX_INCREMENT = 1000;

export function isValidDateKey(date: string): boolean {
  if (!DATE_KEY_PATTERN.test(date)) {
    return false;
  }
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

function buildAggregateWrite(
  db: Database,
  authUserId: string,
  delta: number,
  updatedAt: number
) {
  // Fully atomic upsert (no read-modify-write, no TOCTOU). On first insert the
  // seed is computed in SQL from the daily rows so a lazily-created aggregate
  // matches history; on conflict the increment runs in SQL (`total + delta`),
  // floored at 0. Both branches resolve inside the one statement, so concurrent
  // first-increments can't double-count. Returned (not awaited) so callers can
  // batch it with the daily write — the daily write must run first in the batch
  // so the first-insert seed subquery sees the updated daily count.
  return db
    .insert(dhikrAggregate)
    .values({
      authUserId,
      total: sql`(select coalesce(sum(${dhikrDaily.count}), 0) from ${dhikrDaily} where ${dhikrDaily.authUserId} = ${authUserId})`,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: dhikrAggregate.authUserId,
      set: {
        total: sql`max(0, ${dhikrAggregate.total} + ${delta})`,
        updatedAt,
      },
    });
}

async function findDay(db: Database, authUserId: string, date: string) {
  const [row] = await db
    .select()
    .from(dhikrDaily)
    .where(
      and(eq(dhikrDaily.authUserId, authUserId), eq(dhikrDaily.date, date))
    )
    .limit(1);
  return row;
}

export interface DhikrToday {
  count: number;
  sessionTotal: number;
  target: number;
}

export async function getToday(
  db: Database,
  authUserId: string,
  date: string
): Promise<DhikrToday> {
  const [aggregate] = await db
    .select({ total: dhikrAggregate.total })
    .from(dhikrAggregate)
    .where(eq(dhikrAggregate.authUserId, authUserId))
    .limit(1);
  const sessionTotal = aggregate?.total ?? 0;
  const row = await findDay(db, authUserId, date);
  if (!row) {
    return { count: 0, target: DEFAULT_TARGET, sessionTotal };
  }
  return { count: row.count, target: row.target, sessionTotal };
}

export async function increment(
  db: Database,
  authUserId: string,
  date: string,
  delta: number
): Promise<number> {
  const now = Date.now();
  // Atomic upsert on (authUserId, date): the count increment runs in SQL so two
  // concurrent increments can't clobber each other, and the UNIQUE index makes a
  // racing insert resolve to the update branch instead of a duplicate row.
  const dailyWrite = db
    .insert(dhikrDaily)
    .values({
      authUserId,
      date,
      count: delta,
      target: DEFAULT_TARGET,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [dhikrDaily.authUserId, dhikrDaily.date],
      set: { count: sql`${dhikrDaily.count} + ${delta}`, updatedAt: now },
    })
    .returning({ count: dhikrDaily.count });
  // One atomic batch so the per-day count and the session aggregate can't
  // diverge. The daily write runs first so the aggregate's first-insert seed
  // subquery reads the already-updated daily count.
  const [dailyRows] = await db.batch([
    dailyWrite,
    buildAggregateWrite(db, authUserId, delta, now),
  ]);
  // Convex scheduled this; under REST we evaluate inline (cheap, same txn budget).
  await runEvaluate(db, { authUserId, today: date });
  return dailyRows[0].count;
}

export async function setTarget(
  db: Database,
  authUserId: string,
  date: string,
  target: number
): Promise<void> {
  const now = Date.now();
  await db
    .insert(dhikrDaily)
    .values({
      authUserId,
      date,
      count: 0,
      target,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [dhikrDaily.authUserId, dhikrDaily.date],
      set: { target, updatedAt: now },
    });
}

export async function reset(
  db: Database,
  authUserId: string,
  date: string
): Promise<void> {
  const existing = await findDay(db, authUserId, date);
  if (!existing) {
    return;
  }
  const now = Date.now();
  // Batch the aggregate decrement and the day-zero so they can't desync. The
  // decrement reads the daily count in SQL at write time (not the pre-read
  // `existing.count`, which a concurrent increment could have outdated) and
  // must run before the zeroing statement inside the same batch txn.
  await db.batch([
    db
      .update(dhikrAggregate)
      .set({
        total: sql`max(0, ${dhikrAggregate.total} - coalesce((select ${dhikrDaily.count} from ${dhikrDaily} where ${dhikrDaily.id} = ${existing.id}), 0))`,
        updatedAt: now,
      })
      .where(eq(dhikrAggregate.authUserId, authUserId)),
    db
      .update(dhikrDaily)
      .set({ count: 0, updatedAt: now })
      .where(eq(dhikrDaily.id, existing.id)),
  ]);
}

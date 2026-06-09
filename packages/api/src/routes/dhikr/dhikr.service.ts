import { and, eq, sql } from "drizzle-orm";

import type { Database } from "@/db";
import { dhikrAggregate, dhikrDaily } from "@/db/schema";

import { runEvaluate } from "@/routes/achievements/achievements.service";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DEFAULT_TARGET = 33;
export const MAX_TARGET = 10_000;
export const MAX_INCREMENT = 1000;
// Bounds the aggregate-miss recompute path so a pathological per-user row count
// can't blow the read budget. One row per day → ~137 years.
const SUM_DHIKR_DAILY_LIMIT = 50_000;

export function isValidDateKey(date: string): boolean {
  if (!DATE_KEY_PATTERN.test(date)) {
    return false;
  }
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

async function sumDhikrDaily(
  db: Database,
  authUserId: string
): Promise<number> {
  const rows = await db
    .select({ count: dhikrDaily.count })
    .from(dhikrDaily)
    .where(eq(dhikrDaily.authUserId, authUserId))
    .limit(SUM_DHIKR_DAILY_LIMIT);
  return rows.reduce((sum, row) => sum + row.count, 0);
}

async function updateDhikrAggregate(
  db: Database,
  authUserId: string,
  delta: number,
  updatedAt: number
): Promise<void> {
  // Atomic upsert: the increment happens in SQL (`total + delta`) so concurrent
  // writers can't lose updates (no read-modify-write). The `values.total` seed
  // is used only on first insert (no existing row) — recomputed from the daily
  // rows so a lazily-created aggregate matches history. `max(0, …)` floors it.
  await db
    .insert(dhikrAggregate)
    .values({
      authUserId,
      total: await sumDhikrDaily(db, authUserId),
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
  const [row] = await db
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
  await updateDhikrAggregate(db, authUserId, delta, now);
  // Convex scheduled this; under REST we evaluate inline (cheap, same txn budget).
  await runEvaluate(db, { authUserId, today: date });
  return row.count;
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
  await db
    .update(dhikrDaily)
    .set({ count: 0, updatedAt: now })
    .where(eq(dhikrDaily.id, existing.id));
  await updateDhikrAggregate(db, authUserId, -existing.count, now);
}

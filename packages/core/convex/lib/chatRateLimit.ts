import type { DatabaseReader, DatabaseWriter } from "../_generated/server";

export const DAILY_CHAT_LIMIT = 100;

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayKey(now: number = Date.now()): string {
  const d = new Date(now);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export async function getRemainingForToday(
  db: DatabaseReader,
  authUserId: string,
  date: string = todayKey()
): Promise<number> {
  if (!DATE_KEY_PATTERN.test(date)) {
    throw new Error("Invalid date");
  }
  const row = await db
    .query("chatRateLimits")
    .withIndex("by_user_date", (q) =>
      q.eq("authUserId", authUserId).eq("date", date)
    )
    .unique();
  const used = row?.count ?? 0;
  return Math.max(0, DAILY_CHAT_LIMIT - used);
}

export async function consumeOne(
  db: DatabaseWriter,
  authUserId: string,
  date: string = todayKey()
): Promise<void> {
  if (!DATE_KEY_PATTERN.test(date)) {
    throw new Error("Invalid date");
  }
  const row = await db
    .query("chatRateLimits")
    .withIndex("by_user_date", (q) =>
      q.eq("authUserId", authUserId).eq("date", date)
    )
    .unique();
  const now = Date.now();
  if (row) {
    if (row.count >= DAILY_CHAT_LIMIT) {
      throw new Error("DAILY_LIMIT_REACHED");
    }
    await db.patch(row._id, { count: row.count + 1, updatedAt: now });
    return;
  }
  await db.insert("chatRateLimits", {
    authUserId,
    date,
    count: 1,
    updatedAt: now,
  });
}

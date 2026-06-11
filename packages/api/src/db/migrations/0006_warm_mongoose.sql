-- Dedup before adding UNIQUE: the prior read-then-write upserts could have
-- raced and inserted duplicate rows. Keep the newest cache row per cacheKey
-- (bare-column + max() picks that row in SQLite) and the first profile row
-- per authUserId.
DELETE FROM `prayerTimeCaches` WHERE `id` NOT IN (SELECT `id` FROM `prayerTimeCaches` GROUP BY `cacheKey` HAVING max(`updatedAt`));--> statement-breakpoint
DELETE FROM `users` WHERE `rowid` NOT IN (SELECT min(`rowid`) FROM `users` GROUP BY `authUserId`);--> statement-breakpoint
DROP INDEX `prayerTimeCaches_by_cacheKey`;--> statement-breakpoint
CREATE UNIQUE INDEX `prayerTimeCaches_by_cacheKey` ON `prayerTimeCaches` (`cacheKey`);--> statement-breakpoint
DROP INDEX `users_by_authUserId`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_by_authUserId` ON `users` (`authUserId`);

DROP INDEX `dhikrAggregate_by_user`;--> statement-breakpoint
CREATE UNIQUE INDEX `dhikrAggregate_by_user` ON `dhikrAggregate` (`authUserId`);--> statement-breakpoint
DROP INDEX `dhikrDaily_by_user_date`;--> statement-breakpoint
CREATE UNIQUE INDEX `dhikrDaily_by_user_date` ON `dhikrDaily` (`authUserId`,`date`);--> statement-breakpoint
DROP INDEX `emailQueue_by_dedupeKey`;--> statement-breakpoint
CREATE UNIQUE INDEX `emailQueue_by_dedupeKey` ON `emailQueue` (`dedupeKey`);--> statement-breakpoint
DROP INDEX `prayerLogs_by_user_date_prayer`;--> statement-breakpoint
CREATE UNIQUE INDEX `prayerLogs_by_user_date_prayer` ON `prayerLogs` (`authUserId`,`date`,`prayer`);--> statement-breakpoint
DROP INDEX `shieldSelection_by_user`;--> statement-breakpoint
CREATE UNIQUE INDEX `shieldSelection_by_user` ON `shieldSelection` (`authUserId`);--> statement-breakpoint
DROP INDEX `userAchievementCounters_by_user`;--> statement-breakpoint
CREATE UNIQUE INDEX `userAchievementCounters_by_user` ON `userAchievementCounters` (`authUserId`);--> statement-breakpoint
DROP INDEX `userAchievements_by_user_code`;--> statement-breakpoint
CREATE UNIQUE INDEX `userAchievements_by_user_code` ON `userAchievements` (`authUserId`,`code`);
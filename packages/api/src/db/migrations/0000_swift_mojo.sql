CREATE TABLE `appConfig` (
	`id` text PRIMARY KEY NOT NULL,
	`minSupportedVersion` text NOT NULL,
	`iosStoreUrl` text NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dhikrAggregate` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`total` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `dhikrAggregate_by_user` ON `dhikrAggregate` (`authUserId`);--> statement-breakpoint
CREATE TABLE `dhikrDaily` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`date` text NOT NULL,
	`count` integer NOT NULL,
	`target` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `dhikrDaily_by_user_date` ON `dhikrDaily` (`authUserId`,`date`);--> statement-breakpoint
CREATE TABLE `polarOrders` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text,
	`polarOrderId` text NOT NULL,
	`polarCustomerId` text,
	`customerEmail` text NOT NULL,
	`customerName` text,
	`productId` text,
	`totalAmount` integer NOT NULL,
	`currency` text NOT NULL,
	`invoiceNumber` text,
	`eventType` text NOT NULL,
	`receivedAt` text NOT NULL,
	`confirmationEmailQueuedAt` text,
	`confirmedEmailAt` text,
	`raw` text
);
--> statement-breakpoint
CREATE INDEX `polarOrders_by_polarOrderId` ON `polarOrders` (`polarOrderId`);--> statement-breakpoint
CREATE INDEX `polarOrders_by_customerEmail` ON `polarOrders` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `polarOrders_by_polarCustomerId` ON `polarOrders` (`polarCustomerId`);--> statement-breakpoint
CREATE TABLE `prayerLogs` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`date` text NOT NULL,
	`prayer` text NOT NULL,
	`status` text NOT NULL,
	`prayedAt` integer,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prayerLogs_by_user_date_prayer` ON `prayerLogs` (`authUserId`,`date`,`prayer`);--> statement-breakpoint
CREATE INDEX `prayerLogs_by_user_updated` ON `prayerLogs` (`authUserId`,`updatedAt`);--> statement-breakpoint
CREATE TABLE `prayerTimeCaches` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`cacheKey` text NOT NULL,
	`userCacheKey` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`latitudeRounded` real NOT NULL,
	`longitudeRounded` real NOT NULL,
	`timezone` text NOT NULL,
	`countryCode` text,
	`city` text,
	`method` integer NOT NULL,
	`school` integer NOT NULL,
	`latitudeAdjustmentMethod` integer,
	`midnightMode` integer,
	`tune` text,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	`days` integer NOT NULL,
	`source` text NOT NULL,
	`primarySource` text NOT NULL,
	`fallbackSource` text,
	`timings` text,
	`comparison` text,
	`raw` text,
	`generatedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prayerTimeCaches_by_cacheKey` ON `prayerTimeCaches` (`cacheKey`);--> statement-breakpoint
CREATE INDEX `prayerTimeCaches_by_userCacheKey` ON `prayerTimeCaches` (`userCacheKey`);--> statement-breakpoint
CREATE INDEX `prayerTimeCaches_by_userId` ON `prayerTimeCaches` (`userId`);--> statement-breakpoint
CREATE INDEX `prayerTimeCaches_by_user_updated` ON `prayerTimeCaches` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `prayerTimeCaches_by_expiry` ON `prayerTimeCaches` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `shieldSelection` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`iosSelectionData` text,
	`iosItemCount` integer,
	`androidPackageNames` text,
	`windows` text NOT NULL,
	`enabled` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shieldSelection_by_user` ON `shieldSelection` (`authUserId`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text,
	`customerEmail` text,
	`productId` text NOT NULL,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`claimedAt` text,
	`activatedAt` text,
	`updatedAt` text,
	`expiresAt` text,
	`polarCustomerId` text,
	`polarProductId` text,
	`polarOrderId` text,
	`rcAppUserId` text,
	`rcOriginalAppUserId` text,
	`rcProductIdentifier` text,
	`rcEntitlementId` text,
	`rcStore` text,
	`rcPeriodType` text,
	`rcWillRenew` integer,
	`rcLatestPurchaseAt` text
);
--> statement-breakpoint
CREATE INDEX `subscriptions_by_authUserId` ON `subscriptions` (`authUserId`);--> statement-breakpoint
CREATE INDEX `subscriptions_by_authUserId_status` ON `subscriptions` (`authUserId`,`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_by_customerEmail` ON `subscriptions` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `subscriptions_by_polarOrderId` ON `subscriptions` (`polarOrderId`);--> statement-breakpoint
CREATE INDEX `subscriptions_by_polarCustomerId` ON `subscriptions` (`polarCustomerId`);--> statement-breakpoint
CREATE INDEX `subscriptions_by_rcAppUserId` ON `subscriptions` (`rcAppUserId`);--> statement-breakpoint
CREATE TABLE `userAchievementCounters` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`countablePrayerLogs` integer NOT NULL,
	`fajrOnTimePrayerLogs` integer NOT NULL,
	`onTimePrayerLogs` integer NOT NULL,
	`qadaPrayerLogs` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `userAchievementCounters_by_user` ON `userAchievementCounters` (`authUserId`);--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`code` text NOT NULL,
	`unlockedAt` integer NOT NULL,
	`seenAt` integer
);
--> statement-breakpoint
CREATE INDEX `userAchievements_by_user` ON `userAchievements` (`authUserId`);--> statement-breakpoint
CREATE INDEX `userAchievements_by_user_code` ON `userAchievements` (`authUserId`,`code`);--> statement-breakpoint
CREATE INDEX `userAchievements_by_user_seen` ON `userAchievements` (`authUserId`,`seenAt`);--> statement-breakpoint
CREATE TABLE `userLocations` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`timezone` text NOT NULL,
	`city` text,
	`countryCode` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `userLocations_by_user` ON `userLocations` (`authUserId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`name` text,
	`gender` text,
	`madhab` text,
	`consistency` text,
	`struggle` text,
	`goal` text,
	`calcMethod` text,
	`strictness` text,
	`locationGranted` integer,
	`notifGranted` integer,
	`prayersToLock` text,
	`completedAt` text,
	`image` text,
	`activePrayerLocationId` text
);
--> statement-breakpoint
CREATE INDEX `users_by_authUserId` ON `users` (`authUserId`);
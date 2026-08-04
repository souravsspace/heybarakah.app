CREATE TABLE `liveActivityTokens` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`token` text NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `liveActivityTokens_by_token` ON `liveActivityTokens` (`token`);--> statement-breakpoint
CREATE INDEX `liveActivityTokens_by_user` ON `liveActivityTokens` (`authUserId`);
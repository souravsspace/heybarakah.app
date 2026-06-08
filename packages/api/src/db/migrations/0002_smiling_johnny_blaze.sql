CREATE TABLE `emailQueue` (
	`id` text PRIMARY KEY NOT NULL,
	`dedupeKey` text,
	`to` text NOT NULL,
	`subject` text NOT NULL,
	`html` text NOT NULL,
	`text` text,
	`status` text NOT NULL,
	`attempts` integer NOT NULL,
	`lastError` text,
	`providerId` text,
	`nextAttemptAt` integer NOT NULL,
	`sentAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `emailQueue_by_dedupeKey` ON `emailQueue` (`dedupeKey`);--> statement-breakpoint
CREATE INDEX `emailQueue_by_status_next` ON `emailQueue` (`status`,`nextAttemptAt`);--> statement-breakpoint
CREATE INDEX `emailQueue_by_providerId` ON `emailQueue` (`providerId`);
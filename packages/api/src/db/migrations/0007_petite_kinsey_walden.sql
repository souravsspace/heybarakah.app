CREATE TABLE `dhikrPreset` (
	`id` text PRIMARY KEY NOT NULL,
	`authUserId` text NOT NULL,
	`presetId` text NOT NULL,
	`total` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dhikrPreset_by_user_preset` ON `dhikrPreset` (`authUserId`,`presetId`);
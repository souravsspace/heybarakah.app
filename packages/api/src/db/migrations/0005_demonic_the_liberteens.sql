DROP INDEX `subscriptions_by_polarOrderId`;--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_by_polarOrderId` ON `subscriptions` (`polarOrderId`);
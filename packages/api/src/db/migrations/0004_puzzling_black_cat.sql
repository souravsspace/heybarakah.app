DROP INDEX `polarOrders_by_polarOrderId`;--> statement-breakpoint
CREATE UNIQUE INDEX `polarOrders_by_polarOrderId` ON `polarOrders` (`polarOrderId`);
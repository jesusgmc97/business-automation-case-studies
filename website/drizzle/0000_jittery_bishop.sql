CREATE TABLE `contact_leads` (
	`submission_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text,
	`service` text NOT NULL,
	`message` text NOT NULL,
	`privacy_consent` integer NOT NULL,
	`privacy_notice_version` text NOT NULL,
	`fingerprint` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_leads_created_at_idx` ON `contact_leads` (`created_at`);--> statement-breakpoint
CREATE TABLE `contact_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_rate_limits_expiry_idx` ON `contact_rate_limits` (`expires_at`);
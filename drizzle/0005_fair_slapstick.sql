ALTER TABLE "albums" ADD COLUMN "release_type" varchar(20) DEFAULT 'album' NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "disc_url" text;
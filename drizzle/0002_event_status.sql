ALTER TABLE "events" ADD COLUMN "status" varchar(20) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
UPDATE "events" SET "status" = CASE WHEN "is_published" = true THEN 'published' ELSE 'unpublished' END;--> statement-breakpoint
DROP INDEX "events_published_date_idx";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "is_published";--> statement-breakpoint
CREATE INDEX "events_published_date_idx" ON "events" USING btree ("status","event_date");

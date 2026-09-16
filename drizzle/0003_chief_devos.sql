CREATE TABLE "albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"release_date" date NOT NULL,
	"cover_url" text,
	"title_it" varchar(255) NOT NULL,
	"title_fr" varchar(255),
	"title_en" varchar(255),
	"title_oc" varchar(255),
	"spotify_url" text,
	"apple_music_url" text,
	"youtube_music_url" text,
	"bandcamp_url" text,
	"deezer_url" text,
	"tidal_url" text,
	"amazon_music_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "albums_release_date_idx" ON "albums" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "albums_published_date_idx" ON "albums" USING btree ("status","release_date");--> statement-breakpoint
CREATE INDEX "albums_sort_order_idx" ON "albums" USING btree ("sort_order");
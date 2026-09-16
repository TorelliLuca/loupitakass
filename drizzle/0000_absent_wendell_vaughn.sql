CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_date" date NOT NULL,
	"event_time" varchar(10),
	"venue" varchar(255),
	"city" varchar(120),
	"country" varchar(120),
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"ticket_url" text,
	"flyer_url" text,
	"title_it" varchar(255) NOT NULL,
	"title_fr" varchar(255),
	"title_en" varchar(255),
	"title_oc" varchar(255),
	"description_it" text,
	"description_fr" text,
	"description_en" text,
	"description_oc" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120) NOT NULL,
	"role_it" varchar(255),
	"role_fr" varchar(255),
	"role_en" varchar(255),
	"role_oc" varchar(255),
	"photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "events_event_date_idx" ON "events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "events_published_date_idx" ON "events" USING btree ("is_published","event_date");--> statement-breakpoint
CREATE INDEX "members_sort_order_idx" ON "members" USING btree ("sort_order");
CREATE TABLE "account" (
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "search_keywords" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "rating" real;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "user_ratings_total" integer;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "external_source" text DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "geometry" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_google_place_id_unique" UNIQUE("google_place_id");
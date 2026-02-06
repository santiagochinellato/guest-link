-- Create guest_tokens table for Guest Token System
CREATE TABLE IF NOT EXISTS "guest_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"reservation_id" integer,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"used_at" timestamp,
	CONSTRAINT "guest_tokens_token_unique" UNIQUE("token")
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "guest_tokens" ADD CONSTRAINT "guest_tokens_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS "guest_tokens_token_idx" ON "guest_tokens" ("token");

-- Create index on reservation_id
CREATE INDEX IF NOT EXISTS "guest_tokens_reservation_id_idx" ON "guest_tokens" ("reservation_id");

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS "guest_tokens_expires_at_idx" ON "guest_tokens" ("expires_at");

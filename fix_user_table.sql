-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

-- Drop old users table if exists
DROP TABLE IF EXISTS "users" CASCADE;

-- Re-add foreign key constraints for user table
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_users_id_fk";
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_owner_id_users_id_fk";
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_users_id_fk";
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

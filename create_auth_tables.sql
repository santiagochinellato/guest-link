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

-- Create account table
CREATE TABLE IF NOT EXISTS "account" (
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
	"session_state" text,
	PRIMARY KEY("provider", "providerAccountId")
);

-- Create session table
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp NOT NULL
);

-- Create verificationToken table
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	PRIMARY KEY("identifier", "token")
);

-- Add foreign key constraints
ALTER TABLE "account" 
ADD CONSTRAINT "account_userId_user_id_fk" 
FOREIGN KEY ("userId") REFERENCES "public"."user"("id") 
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "session" 
ADD CONSTRAINT "session_userId_user_id_fk" 
FOREIGN KEY ("userId") REFERENCES "public"."user"("id") 
ON DELETE cascade ON UPDATE no action;

-- Drop old users table if it exists
DROP TABLE IF EXISTS "users" CASCADE;

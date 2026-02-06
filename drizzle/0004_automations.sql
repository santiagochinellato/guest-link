-- Add automation fields to reservations
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "guest_email" text;
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "guest_phone" text;
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "pre_arrival_sent" boolean DEFAULT false;
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "checkout_reminder_sent" boolean DEFAULT false;
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "review_request_sent" boolean DEFAULT false;

-- Add automation settings to properties
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "auto_send_guide" boolean DEFAULT true;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "auto_checkout_reminder" boolean DEFAULT true;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "auto_review_request" boolean DEFAULT true;

-- Create automation_logs table
CREATE TABLE IF NOT EXISTS "automation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_id" integer,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"status" text NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"error" text
);

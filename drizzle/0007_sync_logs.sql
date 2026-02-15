-- Create sync_logs table for extension sync trigger and last sync status
CREATE TABLE IF NOT EXISTS "sync_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "property_id" integer REFERENCES "properties"("id"),
  "status" text NOT NULL,
  "triggered_by" text NOT NULL,
  "log" text,
  "created_at" timestamp DEFAULT now(),
  "completed_at" timestamp
);

-- Add notes and amount_paid to reservations
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "amount_paid" real;

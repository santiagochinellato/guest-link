-- Add guest_language column to reservations
-- Define idioma/nacionalidad del huésped: es, en, pt
-- Usado para mensajes WhatsApp/email y pantalla de la guía digital
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "guest_language" text DEFAULT 'es';

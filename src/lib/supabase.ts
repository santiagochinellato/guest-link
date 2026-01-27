import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para operaciones del servidor
// Usa SUPABASE_SERVICE_ROLE_KEY para tener permisos completos en Storage
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Nombre del bucket para imágenes de propiedades
export const STORAGE_BUCKET = "property-images";

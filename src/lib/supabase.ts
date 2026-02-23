import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para operaciones del servidor (Storage).
// Inicialización diferida para no romper el build si faltan las variables en el entorno.
let _client: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL environment variable");
  if (!supabaseServiceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

export const STORAGE_BUCKET = "property-images";

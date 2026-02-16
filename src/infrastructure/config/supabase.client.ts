import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno de Supabase");
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

// Singleton para el cliente de servidor
let serverClientInstance: ReturnType<typeof createServerClient>;

export function getServerClient() {
  if (!serverClientInstance) {
    serverClientInstance = createServerClient();
  }
  return serverClientInstance;
}

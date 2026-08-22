import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SupabaseURL;
const supabaseKey = process.env.SupabaseKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env vars: SupabaseURL / SupabaseKey (check backend/.env)"
  );
}

// Einziger Anon-Client für requests ohne Nutzerkontext (aktuell nur
// requireAuth.getUser(token)).
export const supabase = createClient(supabaseUrl, supabaseKey);

// Pro-Request-Client, der das JWT des jeweiligen Nutzers mitschickt, damit
// auth.uid() in Postgres (RLS-Policies, SECURITY-INVOKER-Funktionen wie
// check_and_increment_rate_limit) auf diesen Nutzer statt auf die Anon-Rolle
// auflöst. Immer frisch pro Request erzeugen — nie über Nutzer hinweg teilen.
export function supabaseAsUser(token: string): SupabaseClient {
  // Non-null-Assertion ok: der Guard oben wirft schon beim Modul-Import,
  // falls eine der beiden Env-Variablen fehlt.
  return createClient(supabaseUrl!, supabaseKey!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

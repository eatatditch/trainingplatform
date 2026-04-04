import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _db: SupabaseClient | null = null;

// Server-side Supabase client with service role key for DB operations.
// Lazy-initialized to avoid errors during build when env vars aren't available.
export function getDb(): SupabaseClient {
  if (!_db) {
    _db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _db;
}

// Keep `db` export for backward compatibility — uses a Proxy to lazy-init.
export const db = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

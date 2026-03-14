import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Browser/Client Component Supabase client (uses anon key)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

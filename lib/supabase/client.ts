import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
const authClientsByToken = new Map<string, SupabaseClient>();

// Browser/Client Component Supabase client (uses anon key)
export function createClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  return browserClient;
}

/**
 * Create a Supabase client with a Clerk session token
 * so that RLS policies see the user as `authenticated`.
 */
export function createAuthClient(token: string): SupabaseClient {
  const cached = authClientsByToken.get(token);
  if (cached) return cached;

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        // Clerk owns auth/session lifecycle for token-based requests.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  authClientsByToken.set(token, client);
  return client;
}

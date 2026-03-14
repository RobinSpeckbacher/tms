import { auth } from "@clerk/nextjs/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * If called inside a Server Component or Route Handler, it will
 * attach the Clerk JWT so that Supabase RLS policies can identify the user.
 */
export async function createClient() {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: clerkToken
          ? { Authorization: `Bearer ${clerkToken}` }
          : {},
      },
    }
  );
}

/**
 * Admin Supabase client that bypasses RLS.
 * Use only in trusted server-side contexts (e.g., webhooks, cron jobs).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false },
    }
  );
}

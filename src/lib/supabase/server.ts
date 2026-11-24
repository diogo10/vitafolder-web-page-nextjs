import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Create a Supabase client bound to the current request's auth cookies.
 *
 * Used from Server Actions and Server Components so the anon key never has
 * to be exposed to the browser. Returns `null` when `SUPABASE_ANON_KEY` is
 * unset, letting callers fail closed with a generic message instead of
 * crashing at render time.
 *
 * Always create a new client per request — never cache it across requests.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const anonKey = env.SUPABASE_ANON_KEY;

  if (!anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.SUPABASE_URL, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot mutate cookies. Session refreshes are
          // written from Server Actions / Route Handlers instead.
        }
      },
    },
  });
}

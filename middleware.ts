import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware entry point.
 *
 * The session-refresh logic lives in `src/lib/supabase/middleware.ts` so it
 * can be unit tested; this file only wires it to the protected route matcher.
 */
export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

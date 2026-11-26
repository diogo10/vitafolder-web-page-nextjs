import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

const LOGIN_PATH = "/login";

/**
 * Routes that require an authenticated Supabase session. Add new protected
 * route prefixes here and to `config.matcher` below.
 */
const PROTECTED_PREFIXES = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  const next = `${url.pathname}${url.search}`;
  url.pathname = LOGIN_PATH;
  url.search = "";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

/**
 * Refresh the Supabase session for protected routes before they render.
 *
 * `supabase.auth.getUser()` validates the access token with Supabase and
 * rotates the auth cookies when the token is near expiry. The refreshed
 * cookies are written onto both the forwarded request and the response so
 * Server Components see the new session and the browser stores it. Doing this
 * in middleware means the dashboard never renders with a stale token and the
 * user is redirected to `/login?next=...` only when the session is truly
 * invalid.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const protectedPath = isProtectedPath(pathname);

  if (!env.SUPABASE_ANON_KEY) {
    // Fail closed: without an anon key we cannot validate a session.
    return protectedPath ? redirectToLogin(request) : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // A visitor with no session is expected on a protected route; only log
      // unexpected refresh failures.
      if (error.name !== "AuthSessionMissingError") {
        console.error(`[middleware] session refresh failed: ${error.message}`);
      }
    }

    if (protectedPath && !data.user) {
      return redirectToLogin(request);
    }
  } catch (error) {
    console.error(
      `[middleware] session refresh failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    if (protectedPath) {
      return redirectToLogin(request);
    }
  }

  return response;
}

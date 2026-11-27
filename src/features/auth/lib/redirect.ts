export const DEFAULT_AUTH_REDIRECT = "/dashboard";

/**
 * Base used only to parse a candidate destination. It never leaves this
 * module: the parsed origin is compared against it, and only the path,
 * query, and hash are returned.
 */
const NEXT_PATH_ORIGIN = "https://housemira.invalid";

/**
 * Control characters (including encoded CR/LF/TAB) can be used for header
 * injection and open-redirect tricks, and backslashes are normalized to
 * slashes by URL parsers, so both are rejected outright.
 */
const FORBIDDEN_PATH_CHARS = /[\u0000-\u001F\u007F\\]/;

function hasForbiddenChars(value: string): boolean {
  if (FORBIDDEN_PATH_CHARS.test(value)) return true;
  try {
    // Catch percent-encoded controls such as `%09`, `%0A`, and `%0D`.
    return FORBIDDEN_PATH_CHARS.test(decodeURIComponent(value));
  } catch {
    // Malformed escapes cannot be validated safely; fail closed.
    return true;
  }
}

/**
 * Normalize the post-login destination.
 *
 * Only same-origin, absolute paths are allowed. The value is parsed with
 * `new URL(value, origin)` so protocol-relative (`//host`), backslash-prefixed
 * (`/\host`), and otherwise ambiguous inputs are resolved exactly like a
 * browser would before the origin check runs. Control characters (raw or
 * percent-encoded) are rejected outright. Anything that fails a check falls
 * back to the dashboard, which adds `?next=/dashboard` so a signed-out
 * visitor still lands where they intended after signing in.
 */
export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_AUTH_REDIRECT;
  if (!value.startsWith("/")) return DEFAULT_AUTH_REDIRECT;
  if (hasForbiddenChars(value)) return DEFAULT_AUTH_REDIRECT;

  let parsed: URL;
  try {
    parsed = new URL(value, NEXT_PATH_ORIGIN);
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (parsed.origin !== NEXT_PATH_ORIGIN) return DEFAULT_AUTH_REDIRECT;

  // Rebuild from the parsed URL so normalization (dot segments, etc.) is
  // consistent and no fragment/query tricks survive.
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

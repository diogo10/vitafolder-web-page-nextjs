export const DEFAULT_AUTH_REDIRECT = "/dashboard";

/**
 * Normalize the post-login destination.
 *
 * Only same-origin, absolute paths are allowed. Protocol-relative (`//host`)
 * and backslash-prefixed (`/\host`) values are treated as open-redirect
 * attempts and fall back to the dashboard. The dashboard redirect adds
 * `?next=/dashboard` so a signed-out visitor still lands where they intended
 * after signing in.
 */
export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_AUTH_REDIRECT;
  if (!value.startsWith("/")) return DEFAULT_AUTH_REDIRECT;
  if (value.startsWith("//") || value.startsWith("/\\")) return DEFAULT_AUTH_REDIRECT;
  if (value.includes("\\")) return DEFAULT_AUTH_REDIRECT;
  return value;
}

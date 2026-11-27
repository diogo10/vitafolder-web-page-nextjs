import { createHash } from "crypto";
import { headers } from "next/headers";

function hashCookie(cookie: string): string {
  return createHash("sha256").update(cookie).digest("hex").slice(0, 32);
}

/**
 * Resolve a per-request rate-limit key for public Server Actions.
 *
 * Prefers the client IP, falls back to a hash of the session/cookie header
 * (never the raw cookie value), and returns `null` when neither is available
 * so callers can decide how to fail closed.
 *
 * Proxy trust boundary: `x-forwarded-for` / `x-real-ip` are client-controlled
 * and trivially spoofable. Only trust them when the hosting platform or
 * reverse proxy overwrites them (e.g. Vercel, Fly, or NGINX with
 * `proxy_set_header X-Forwarded-For $remote_addr`). Do not trust a
 * pass-through value from an untrusted proxy. Empty or whitespace-only
 * headers are treated as missing.
 */
export async function resolveRateLimitKey(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for")?.trim() || undefined;
    const firstForwarded = forwardedFor?.split(",")[0]?.trim() || undefined;
    const realIp = headerList.get("x-real-ip")?.trim() || undefined;
    const ip = firstForwarded || realIp;
    if (ip) return `ip:${ip}`;
    const cookie = headerList.get("cookie")?.trim() || undefined;
    if (cookie) return `cookie:${hashCookie(cookie)}`;
  } catch {
    // Outside a request scope (unit tests, build): no per-request key.
  }
  return null;
}
